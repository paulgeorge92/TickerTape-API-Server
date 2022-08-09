const axios = require('axios');
const BASE_URL = 'https://api.tickertape.in/stocks';


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
            "risk": data.labels.risk.title,
            "marketCap": data.labels.marketCap.title,
            "technicals": {
                "52wHigh": data.ratios['52wHigh'],
                "52wLow": data.ratios['52wLow'],
                "beta": data.ratios['beta'],
                "divYield": data.ratios['divYield'],
                "mrktCapRank": data.ratios['mrktCapRank'],
                "marketCap": data.ratios['marketCap'],
                "pb": data.ratios['pb'],
                "pe": data.ratios['pe'],
                "risk": data.ratios['risk'],
                "ltp": data.ratios['lastPrice']
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
        
        const getState= (checklistItem)=>!!(data.filter(item=>item.title == checklistItem)[0]?.state == "checked");
        
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
        if(data?.length){
            return {
                price: data[0].price,
                crossed52wH: data[0].crossedHigh,
                crossed52wL: data[0].crossedLow,
                change: data[0].change,
                dayChange: data[0].dyChange,
                weekChange: data[0].wkChange,
                monthChange: data[0].mnChange
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