const axios = require('axios');
const BASE_URL = 'https://api.tickertape.in/stocks';

function formatNumber(num, decimalPoints){
  return parseFloat(num.toFixed(decimalPoints||2));
}

async function getStockInfo(sid){
    let req = {
        method: 'get',
        url: `${BASE_URL}/info/${sid}`,
        headers: { }
    };
    
    try{
        let response = await axios(req);
        let data = response.data.data;
        let body = {
            "description": data.info.description,
            "url": data.slug,
            "isin": data.isin,
            "riskLabel": data.labels.risk.title,
            "marketCapLabel": data.labels.marketCap.title,
            "technicals": {
                "52wHigh": formatNumber(data.ratios['52wHigh'] || 0),
                "52wLow": formatNumber(data.ratios['52wLow'] || 0),
                "beta": formatNumber(data.ratios['beta'] || 0),
                "divYield": formatNumber(data.ratios['divYield'] || 0),
                "mrktCapRank": formatNumber(data.ratios['mrktCapRank'] || 0),
                "marketCap": formatNumber(data.ratios['marketCap'] || 0),
                "pb": formatNumber(data.ratios['pb'] || 0),
                "pe": formatNumber(data.ratios['pe'] || 0),
                "risk": formatNumber(data.ratios['risk'] || 0),
                "ltp": formatNumber(data.ratios['lastPrice'] || 0)
            }
        }
        return body;
    }
    catch(ex){
        console.log(ex)
        throw ex;
    }
}

async function getStockCheckList(sid){
    let req = {
        method: 'get',
        url: `${BASE_URL}/investmentChecklists/${sid}`,
        headers: { }
    };
    
    try{
        let response = await axios(req);
        let data = response.data.data;
        
        const getState= (checklistItem)=>!!(data.filter(item=>item.title == checklistItem)[0].state == "checked");
        
        let body = {
            'IntrinsicValue': getState('Intrinsic Value'),
            'ROEvsFD': getState('ROE vs FD rates'),
            'DividendReturns': getState('Dividend Returns'),
            'EntryPoint': getState('Entry Point'),
            'RedFlags': getState('No Red Flags'),
        }
        return body;
    }
    catch(ex){
        console.log(ex)
        throw ex;
    }
}

async function getCurrentPrice(sid){
     let req = {
        method: 'get',
        url: `https://quotes-api.tickertape.in/quotes?sids=${sid}`,
        headers: { }
    };
    
    try{
        let response = await axios(req);
        let data = response.data.data;
        console.log('data: ', JSON.stringify(data));
        if(data && data.length){
            return {
                price: formatNumber(data[0].price || 0),
                crossed52wH: data[0].crossedHigh,
                crossed52wL: data[0].crossedLow,
                change: formatNumber(data[0].change || 0),
                dayChange: formatNumber(data[0].dyChange || 0),
                weekChange: formatNumber(data[0].wkChange || 0),
                monthChange: formatNumber(data[0].mnChange || 0)
            };
        }
        return null;
    }
    catch(ex){
        console.log(ex)
        throw ex;
    }
}

module.exports  = {getStockInfo,getStockCheckList, getCurrentPrice};