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

  async function setHistory(startDate, endDate) {
    let firstTradeDate = startDate || "02/17/2022";
    let LastTradeDate = endDate || "08/25/2022";

    let purchaseHistory = await sp.getPurchaseHistory();
    let purchasedStocks = await sp.getStocks(true);

    let stocks = [];
    function getStock(sid) {
      return stocks.filter((stock) => stock.sid == sid)[0];
    }

    purchasedStocks.forEach((st) => {
      let stock = {
        sid: st.TickerTapeID,
        history: {},
        totalQty: 0,
        totalInv: 0,
      };
      stocks.push(stock);
    });

    for (let i = 0; i < stocks.length; i++) {
      let stock = stocks[i];
      await getPriceHistory(stock.sid);
      let ltp = 0;
      let totalQty = 0;
      let totalInv = 0;
      let currDate = new Date("2022-03-17T00:00:00.000Z");
      while (currDate.toISOString != LastTradeDate.toISOString()) {
        let qty = totalQty;
        let inv = totalInv;
        let dayInv = 0;
        let currVal = 0;
        let purchases = purchaseHistory.filter((purchase) => {
          let date = new Date(purchase.PurchaseDate);
          date.setHours(date.getHours() + 5, 30, 0, 0);
          return (
            date.toISOString() == currDate.toISOString() &&
            purchase.Stock.TickerTapeID == stock.sid
          );
        });
        if (purchases.length) {
          let dayQty = purchases.reduce((a, b) => a + b.Qty, 0);
          dayInv = purchases.reduce(
            (a, b) => a + parseFloat(b.Buy_x0020_Value),
            0
          );

          stock.totalQty += dayQty;
          stock.totalInv += dayInv;
        }
        stock.history[currDate.toLocaleDateString()] = {
          qty: stock.totalQty,
          inv: stock.totalInv,
          dayInv: dayInv,
        };
      }
    }
  }

  module.exports = { launch, getStockInfo, getStockChecklist, getCurrentPrice };
})();