
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const endPoints = require("./endPoints");


const endPointPrefix = process.env.apiPrefix;
const app = express();

app.use(cors());

app.get(endPointPrefix + "", async (req, res) => {
  res.send(await endPoints.launch());
});

app.get(endPointPrefix + "getStockInfo/:sid", async (req, res) => {
  const sid = req.params.sid;
  res.send(await endPoints.getStockInfo(sid));
});

app.get(endPointPrefix + "getStockChecklist/:sid", async (req, res) => {
    const sid = req.params.sid;
    res.send(await endPoints.getStockChecklist(sid));
});

app.get(endPointPrefix + "getCurrentPrice/:sid", async (req, res) => {
  const sid = req.params.sid;
  res.send(await endPoints.getCurrentPrice(sid));
});

app.get(endPointPrefix + "getHistory", async (req, res) => {
   res.send(await endPoints.getHistory());
});

app.listen();