const express = require("express");
const fs = require("fs");
const path = require("path");
const util = require("util");

const app = express();
app.use(express.json());

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const appendFile = util.promisify(fs.appendFile);

const gradesPathJson = path.resolve(__dirname, "database", "grades.json");

let gradesJson = [];

async function start() {
  gradesJson = JSON.parse(await loadJsonGrade());
  gradesNextId = gradesJson.nextId;
}

function loadJsonGrade() {
  return readFile(gradesPathJson);
}

async function createGrade(data) {
  const { student, subject, type, value } = data;

  if (!student || !subject || !type || !value ) {
    return {error: "student, subject, type, value são campos obrigatórios"};
  }
  const nextJsonId = gradesJson.nextId;
  try {
    const item = {
      id: nextJsonId,
      student,
      subject,
      type,
      value,
      timestamp: new Date(),
    };

    const gradesUpdate = [...gradesJson.grades, item];
    const nextId = nextJsonId+1;

    writeFile(gradesPathJson, JSON.stringify({nextId, gradesUpdate}), err => console.log(err));
    
    return item;
  } catch (err) {
    return err;
  }
}

start();

app.get("/", async (_, res) => {
  return res.json(gradesJson);
});

app.post("/create", async (req, res) => {
  const data = await createGrade(req.body);
  return res.json(data);
});

module.exports = app;
