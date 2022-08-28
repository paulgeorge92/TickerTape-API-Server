const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const endPoints = require("./endPoints");

const app = express();

app.use(cors());

app.get("/", async (req, res) => {
  res.send(await endPoints.launch());
});

app.get("/getStockInfo/:sid", async (req, res) => {
  const sid = req.params.sid;
  res.send(await endPoints.getStockInfo(sid));
});

app.get("/getStockChecklist/:sid", async (req, res) => {
  const sid = req.params.sid;
  res.send(await endPoints.getStockChecklist(sid));
});

app.get("/getCurrentPrice/:sid", async (req, res) => {
  const sid = req.params.sid;
  res.send(await endPoints.getCurrentPrice(sid));
});

app.get("/getHistory", async (req, res) => {
   res.send(await endPoints.getHistory());
});

app.listen();