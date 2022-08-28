const axios = require("axios");
const qs = require("qs");
const SPConfig = {
  ClientID: process.env.SPClientID,
  ClientSecret: decodeURIComponent(process.env.SPClientSecret),
  TenantID: process.env.SPTenantID,
  TenantUrl: process.env.SPTenantUrl,
  SiteUrl: decodeURIComponent(process.env.SPSiteUrl),
  Lists: {
    PurchaseHistory: "Purchase History",
    Stocks: "Stocks",
    PortfolioHistory: "Portfolio History",
  },
};
(function () {

  

  let access_token = {
    access_token: "",
    expires_on: new Date(),
  };
  async function getAccessToken() {
    if (access_token.access_token && new Date() < access_token.expires_on) {
      console.log("Valid Access Token available");
      return access_token.access_token;
    } else {
      var data = qs.stringify({
        grant_type: "client_credentials",
        resource: `00000003-0000-0ff1-ce00-000000000000/${SPConfig.TenantUrl}@${SPConfig.TenantID}`,
        client_id: `${SPConfig.ClientID}@${SPConfig.TenantID}`,
        client_secret: SPConfig.ClientSecret,
      });
      var config = {
        method: "post",
        url: `https://accounts.accesscontrol.windows.net/${SPConfig.TenantID}/tokens/OAuth/2`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: data,
      };

      try {
        let response = await axios(config);
        console.log(JSON.stringify(response.data));
        access_token.access_token = response.data.access_token;
        access_token.expires_on = new Date(response.data.expires_on * 1000);
        return response.data.access_token;
      } catch (ex) {
        return "An Error Ocurred while generating Access Token";
      }
    }
  }

  async function getPurchaseHistory() {
    let token = await getAccessToken();

    let req = {
      method: "GET",
      url: `${SPConfig.SiteUrl}/_api/Web/Lists/GetByTitle('${SPConfig.Lists.PurchaseHistory}')/items?$Select=Stock/ID,Stock/Title,Stock/TickerTapeID,Buy_x0020_Value,PurchaseDate,Qty,PurchasePrice&$Expand=Stock&$top=4999`,
      headers: {
        Accept: "application/json;odata=nometadata",
        "Content-Type": "application/json;odata=nometadata",
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      let res = await axios(req);
      let items = res.data.value.map(item=>{
        let date = new Date(item.PurchaseDate);
        date.setHours(date.getHours() + 5);
        date.setMinutes(date.getMinutes() + 30);
        return {
          stock: item.Stock,
          purchaseDate: date.toISOString(),
          purchasePrice: item.PurchasePrice,
          buyValue: parseFloat(item.Buy_x0020_Value),
          qty: item.Qty
        }
      });

      return items;
    } catch (ex) { 
      return "Error";
    }
  }

  async function getStocks(onlyPurchased) {
    let token = await getAccessToken();

    let req = {
      method: "GET",
      url: `${SPConfig.SiteUrl}/_api/Web/Lists/GetByTitle('${SPConfig.Lists.Stocks}')/items?$Select=Title,StockCode,TickerTapeID,ID,LTP,Qty,ISIN${onlyPurchased ? '&$Filter=Qty gt 0': ''}&$top=4999`,
      headers: {
        Accept: "application/json;odata=nometadata",
        "Content-Type": "application/json;odata=nometadata",
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      let res =  await axios(req);
      let items = res.data.value.map(item=>({
        id: item.ID,
        isin: item.ISIN,
        ltp: item.LTP,
        qty: item.Qty,
        stockCode: item.StockCode,
        sid: item.TickerTapeID,
        name: item.Title
      }));
      return items;
    } catch (ex) {
      return "Error";
     }

  }

  async function updatePortfolioHistory(data) { }

  module.exports = { getPurchaseHistory, getStocks, updatePortfolioHistory };
})();