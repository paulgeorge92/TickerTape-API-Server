const tickerTape = require("./services/tickertape");
const sp = require("./services/sharepoint");

(function () {
  async function launch() {
    return "This is the entry point of Investment API. Don't try to mess with me. It will only do harm";
  }

  async function getStockInfo(sid) {
    try {
      return await tickerTape.getStockInfo(sid);
    } catch (ex) {
      return JSON.stringify(ex);
    }
  }

  async function getStockChecklist(sid) {
    try {
      return await tickerTape.getStockCheckList(sid);
    } catch (ex) {
      return JSON.stringify(ex);
    }
  }

  async function getCurrentPrice(sid) {
    try {
      return await tickerTape.getCurrentPrice(sid);
    } catch (ex) {
      return JSON.stringify(ex);
    }
  }

  async function getHistory(startDate, endDate) {
    let firstTradeDate = new Date(startDate || "02/17/2022");
    let LastTradeDate = new Date(endDate || "08/25/2022");

    //All purchase histort till date
    let purchaseHistory = await sp.getPurchaseHistory();

    //List of purchased stocks till date
    let purchasedStocks = await sp.getStocks(true);

    //This object will hold the overall daily investment and profits
    let portfolioHistory = {};

    //Stocks object
    let stocks = [];
    function getStock(sid) {
      return stocks.filter((stock) => stock.sid == sid)[0];
    }

    // Create initial empty object for each purchased stocks
    purchasedStocks.forEach((st) => {
      let stock = {
        sid: st.sid,
        history: {},
        totalQty: 0,
        totalInv: 0,
      };
      stocks.push(stock);
    });

    // For each purchased stocks, get the price history and update the entry for each day from Start date till end date
    for (let i = 0; i < stocks.length; i++) {
      let stock = stocks[i];

      // Keeping Last day LTP for daily PL and copying LTP for holidays
      let lastLTP = 0;

      //Getting Price history for stock for One Year
      let priceHirtories = await tickerTape.getPriceHistory(stock.sid, tickerTape.ReturnPeriod._1Year);

      let currDate = new Date(firstTradeDate);

      //Looping for each day
      while (currDate < LastTradeDate) {
        let dayInv = 0; //reseting dayInvested
        let dailyPL = 0;
        let ltp = 0;
        //Filtering purchased for the given date
        let purchases = purchaseHistory.filter((purchase) => purchase.purchaseDate == currDate.toISOString() && purchase.stock.TickerTapeID == stock.sid);

        if (purchases.length) {
          //getting total Qty for the date
          let dayQty = purchases.reduce((a, b) => a + b.qty, 0);

          //getting total buy value for the date
          dayInv = purchases.reduce((a, b) => a + parseFloat(b.buyValue), 0);

          // Adding qty and Investment of date to total qty and Innvestment
          stock.totalQty += dayQty;
          stock.totalInv += dayInv;
        }

        //Getting LTP for given date
        let ltpObj = priceHirtories.filter(history => history.date == currDate.toISOString())[0];

        //If LTP is not available, set that as Last LTP as LTP
        if (!ltpObj) {
          ltp = lastLTP;
        }
        else {
          ltp = ltpObj.ltp
          //calculating daily PL
          dailyPL = stock.totalQty > 0 ? parseFloat((stock.totalQty * (ltp - lastLTP)).toFixed(2)) : 0;
        }

        let dayObj = {
          qty: stock.totalQty,
          inv: stock.totalInv,
          dayInv: dayInv,
          currVal: parseFloat((stock.totalQty * ltp).toFixed(2)),
          dailyPL: dailyPL,
          ltp: ltp
        }
        stock.history[currDate.toISOString()] = dayObj;

        if (!portfolioHistory[currDate.toISOString()]) {
          portfolioHistory[currDate.toISOString()] = {
            totalInv: 0,
            currVal: 0,
            dayInv: 0,
            dailyPL: 0
          };
        }

        //updating overal portfolio history for the date
        portfolioHistory[currDate.toISOString()].totalInv += dayObj.inv;
        portfolioHistory[currDate.toISOString()].currVal += dayObj.currVal;
        portfolioHistory[currDate.toISOString()].dayInv += dayObj.dayInv;
        portfolioHistory[currDate.toISOString()].dailyPL += dayObj.dailyPL;


        //setting last LTP as current LTP
        lastLTP = ltp;

        //incrementing currDate
        currDate.setDate(currDate.getDate() + 1);
      }
    }

    let dailyPortfolio = [];

    for (let date in portfolioHistory) {
      dailyPortfolio.push({date, ...portfolioHistory[date]});
    }


    return dailyPortfolio;
  }

  module.exports = { launch, getStockInfo, getStockChecklist, getCurrentPrice, getHistory };
})();