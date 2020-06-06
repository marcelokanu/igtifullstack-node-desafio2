const express = require("express");
const fs = require("fs");
const path = require("path");
const util = require("util");

const app = express();
app.use(express.json());

const readFile = util.promisify(fs.readFile);

let grades = [];

async function start() {
  grades = JSON.parse(await loadJsonGrade());
}

function loadJsonGrade () {
  return readFile(path.resolve(__dirname, "database", "grades.json"));
};
start();

app.get("/", async (_, res) => {
  
  return res.json(grades);
});

module.exports = app;
