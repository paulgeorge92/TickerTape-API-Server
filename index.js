const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const tickerTape = require('./tickertape');
const { stringify } = require('querystring');
const app = express();
const port = 3000;

app.use(cors());

app.get('/', async(req, res) => {
    res.send("Hello!!")
});

app.get('/getStockInfo/:sid',async (req,res)=>{
    const sid = req.params.sid;
    try{
        let data = await tickerTape.getStockInfo(sid);
    res.send(data);
    }
    catch(ex){
        res.send(JSON.stringify(ex))
    }
});

app.get('/getStockChecklist/:sid',async (req,res)=>{
    const sid = req.params.sid;
    let data = await tickerTape.getStockCheckList(sid);
    res.send(data);
});

app.get('/getCurrentPrice/:sid', async(req, res)=>{
    const sid = req.params.sid;
    try{
        let data = await tickerTape.getCurrentPrice(sid);
        res.send(data);
    }
    catch(ex){
        res.send(JSON.stringify(ex))
    }
})

app.listen()