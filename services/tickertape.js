const axios = require("axios");
const BASE_URL = "https://api.tickertape.in/stocks";
const CHART_URL = BASE_URL + "/charts/inter";
function formatNumber(num, decimalPoints) {
  return parseFloat((num || 0).toFixed(decimalPoints || 2));
}

const ReturnPeriod = {
  _1Month: "1mo",
  _1Year: "1y",
  _5Yr: "5y",
  Max: "max",
};

/**
 * Returns the stock returns for a give period
 * @param {string} sid TickerTape ID
 * @param {ReturnPeriod} period ReturnPeriod
 * @returns {float} Returns
 */
async function getReturns(sid, period) {
  let req = {
    method: "get",
    url: `${CHART_URL}/${sid}?duration=${period}`,
    headers: {},
  };
  let res = await axios(req);
  return res.data.data[0].r;
}

/**
 * Returns the information for a give stock
 * @param {string} sid TickerTape ID
 * @returns {*} Stock Information
 */
async function getStockInfo(sid) {
  let infoReq = {
    method: "get",
    url: `${BASE_URL}/info/${sid}`,
    headers: {},
  };

  try {
    let infoRes = await axios(infoReq);
    let stock = infoRes.data.data;

    let _1mnReturn = await getReturns(sid, ReturnPeriod._1Month);
    let _1yrReturn = await getReturns(sid, ReturnPeriod._1Year);
    let _5yrReturn = await getReturns(sid, ReturnPeriod._5Yr);
    let maxReturn = await getReturns(sid, ReturnPeriod.Max);

    let body = {
      description: stock.info.description,
      url: stock.slug,
      isin: stock.isin,
      riskLabel: stock.labels.risk.title,
      marketCapLabel: stock.labels.marketCap.title,
      technicals: {
        "52wHigh": formatNumber(stock.ratios["52wHigh"] || 0),
        "52wLow": formatNumber(stock.ratios["52wLow"] || 0),
        beta: formatNumber(stock.ratios["beta"] || 0),
        divYield: formatNumber(stock.ratios["divYield"] || 0),
        mrktCapRank: formatNumber(stock.ratios["mrktCapRank"] || 0),
        marketCap: formatNumber(stock.ratios["marketCap"] || 0),
        pb: formatNumber(stock.ratios["pb"] || 0),
        pe: formatNumber(stock.ratios["pe"] || 0),
        risk: formatNumber(stock.ratios["risk"] || 0),
        ltp: formatNumber(stock.ratios["lastPrice"] || 0),
      },
      returns: {
        "1MonthReturns": formatNumber(_1mnReturn),
        "1YearReturns": formatNumber(_1yrReturn),
        "5YearsReturns": formatNumber(_5yrReturn),
        MaxReturns: formatNumber(maxReturn),
      },
    };
    return body;
  } catch (ex) {
    console.log(ex);
    throw ex;
  }
}

/**
 * Returns the checklist for given stock
 * @param {string} sid TickerTape ID
 * @returns Checklist
 */
async function getStockCheckList(sid) {
  let req = {
    method: "get",
    url: `${BASE_URL}/investmentChecklists/${sid}`,
    headers: {},
  };

  try {
    let response = await axios(req);
    let data = response.data.data;

    const getState = (checklistItem) =>
      !!(
        data.filter((item) => item.title == checklistItem)[0].state == "checked"
      );

    let body = {
      IntrinsicValue: getState("Intrinsic Value"),
      ROEvsFD: getState("ROE vs FD rates"),
      DividendReturns: getState("Dividend Returns"),
      EntryPoint: getState("Entry Point"),
      RedFlags: getState("No Red Flags"),
    };
    return body;
  } catch (ex) {
    console.log(ex);
    throw ex;
  }
}

/**
 * Returns the current price and variations for given stock
 * @param {string} sid TickerTape ID
 * @returns Current Price with variantions
 */
async function getCurrentPrice(sid) {
  let req = {
    method: "get",
    url: `https://quotes-api.tickertape.in/quotes?sids=${sid}`,
    headers: {},
  };

  try {
    let response = await axios(req);
    let data = response.data.data;
    console.log("data: ", JSON.stringify(data));
    if (data && data.length) {
      return {
        price: formatNumber(data[0].price || 0),
        crossed52wH: data[0].crossedHigh,
        crossed52wL: data[0].crossedLow,
        change: formatNumber(data[0].change || 0),
        dayChange: formatNumber(data[0].dyChange || 0),
        weekChange: formatNumber(data[0].wkChange || 0),
        monthChange: formatNumber(data[0].mnChange || 0),
      };
    }
    return null;
  } catch (ex) {
    console.log(ex);
    throw ex;
  }
}

/**
 * Returns the stock LTPs for a give period
 * @param {string} sid TickerTape ID
 * @param {ReturnPeriod} period ReturnPeriod
 * @returns {{ltp:string;date:string}[]} Returns
 */
async function getPriceHistory(sid, period) {
  let req = {
    method: "get",
    url: `${CHART_URL}/${sid}?duration=${period}`,
    headers: {},
  };
  let res = await axios(req);
  return res.data.data[0].points.map((point) => ({
    ltp: point.lp,
    date: point.ts,
  }));
}
module.exports = {
  getStockInfo,
  getStockCheckList,
  getCurrentPrice,
  getPriceHistory,
  ReturnPeriod,
};