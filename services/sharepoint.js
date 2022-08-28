const axios = require("axios");
const qs = require("qs");
(function () {
  const creds = {
    ClientID: process.env.SPClientID,
    ClientSecret: decodeURIComponent(process.env.SPClientSecret),
    TenantID: process.env.SPTenantID,
    TenantUrl: process.env.SPTenantUrl,
    SiteUrl: process.env.SPSiteUrl,
    Lists: {
      PurchaseHistory: "Purchase History",
      Stocks: "Stocks",
      PortfolioHistory: "Portfolio History",
    },
  };

  let access_token = {
    access_token: "",
    expires_on: new Date(),
  };
  async function getAccessToken() {
    //console.log(creds);
    //return creds;
    if (access_token.access_token && new Date() < access_token.expires_on) {
      console.log("Valid Access Token available");
      return access_token.access_token;
    } else {
      var data = qs.stringify({
        grant_type: "client_credentials",
        resource: `00000003-0000-0ff1-ce00-000000000000/${creds.TenantUrl}@${creds.TenantID}`,
        client_id: `${creds.ClientID}@${creds.TenantID}`,
        client_secret: creds.ClientSecret,
      });
      var config = {
        method: "post",
        url: `https://accounts.accesscontrol.windows.net/${creds.TenantID}/tokens/OAuth/2`,
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
      url: `${config.SiteUrl}/_api/Web/Lists/GetByTitle('${config.Lists.PurchaseHistory}')/items?$Select=Stock/ID,Stock/Title,Stock/TickerTapeID,Buy_x0020_Value,PurchaseDate,Qty,PurchasePrice&$Expand=Stock`,
      headers: {
        Accept: "application/json;odata=nometadata",
        "Content-Type": "application/json;odata=nometadata",
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      return await axios(req).data;
    } catch (ex) {}
  }

  async function getStocks(onlyPurchased) {}

  async function updatePortfolioHistory(data) {}

  module.exports = { getPurchaseHistory, getStocks, updatePortfolioHistory };
})();