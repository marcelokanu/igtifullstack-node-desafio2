const express = require("express");
const fs = require("fs");
const path = require("path");
const util = require("util");

const app = express();
app.use(express.json());

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const gradesPathJson = path.resolve(__dirname, "database", "grades.json");

let gradesJsonCompleto = [];
let gradesJsonGrades = [];

async function start() {
  gradesJsonCompleto = JSON.parse(await loadJsonGrade());
  gradesJsonGrades = gradesJsonCompleto.grades;
}

function loadJsonGrade() {
  return readFile(gradesPathJson);
}

async function createGrade(data) {
  const { student, subject, type, value } = data;

  if (!student || !subject || !type || !value) {
    return { error: "student, subject, type, value são campos obrigatórios" };
  }
  const nextJsonId = gradesJsonCompleto.nextId;
  try {
    const item = {
      id: nextJsonId,
      student,
      subject,
      type,
      value,
      timestamp: new Date(),
    };

    const grades = [...gradesJsonGrades, item];
    const nextId = nextJsonId + 1;

    writeFile(gradesPathJson, JSON.stringify({ nextId, grades }), (err) =>
      console.log(err)
    );

    return item;
  } catch (err) {
    return err;
  }
}

async function updateGrade(id, data) {
  const { student, subject, type, value } = data;

  if (!student || !subject || !type || !value) {
    return { error: "student, subject, type, value são campos obrigatórios" };
  }

  try {
    const gradeIndex = gradesJsonGrades.findIndex((grade) => grade.id === id);

    if (gradeIndex < 0) {
      return { error: "Grade não encontrada." };
    }

    gradesJsonGrades[gradeIndex].student = student;
    gradesJsonGrades[gradeIndex].subject = subject;
    gradesJsonGrades[gradeIndex].type = type;
    gradesJsonGrades[gradeIndex].value = value;

    writeFile(gradesPathJson, JSON.stringify(gradesJsonCompleto), (err) =>
      console.log(err)
    );

    return gradesJsonGrades[gradeIndex];
  } catch (err) {
    return err;
  }
}

async function deleteGrade(id) {
  try {
    const gradeIndex = gradesJsonGrades.findIndex((grade) => grade.id === id);

    if (gradeIndex < 0) {
      return { error: "Grade não encontrada." };
    }

    gradesJsonGrades.splice(gradeIndex, 1);

    writeFile(gradesPathJson, JSON.stringify(gradesJsonCompleto), (err) =>
      console.log(err)
    );

    return { success: `Grade id ${id} removida.` };
  } catch (err) {
    return err;
  }
}

async function totalNota(data) {
  const { student, subject } = data;

  if (!student || !subject) {
    return { error: "student e subject são campos obrigatórios" };
  }

  const gradesFiltered = gradesJsonGrades.filter(
    (grade) => grade.student === student && grade.subject === subject
  );

  const totalNota = gradesFiltered.reduce(
    (acc, current) => acc + current.value,
    0
  );

  return { totalNota, grades: gradesFiltered };
}

async function mediaGrade(data) {
  const { subject, type } = data;

  if (!subject || !type) {
    return { error: "Subject e type são campos obrigatórios" };
  }

  const gradesFiltered = gradesJsonGrades.filter(
    (grade) => grade.subject === subject && grade.type === type
  );

  const mediaNota =
    gradesFiltered.reduce((acc, current) => acc + current.value, 0) /
    gradesFiltered.length;

  return { mediaNota, grades: gradesFiltered };
}

async function top3Grades(data) {
  const { subject, type } = data;

  if (!subject || !type) {
    return { error: "Subject e type são campos obrigatórios" };
  }

  const gradesFiltered = gradesJsonGrades.filter(
    (grade) => grade.subject === subject && grade.type === type
  );

  const top3grades = gradesFiltered.sort((a,b) => b.value-a.value).slice(0,3);

  return { top3grades };
}

app.get("/", async (_, res) => {
  return res.json(gradesJsonCompleto);
});

//1 - Create Grade
app.post("/create", async (req, res) => {
  const data = await createGrade(req.body);
  return res.json(data);
});

//2 - Update Grade
app.put("/update/:id", async (req, res) => {
  const data = await updateGrade(Number(req.params.id), req.body);
  return res.json(data);
});

//3 - Delete Grade
app.delete("/delete/:id", async (req, res) => {
  const data = await deleteGrade(Number(req.params.id));
  return res.json(data);
});

//4 - Show Grade
app.get("/grade/:id", async (req, res) => {
  const id = Number(req.params.id);
  const gradeIndex = gradesJsonGrades.findIndex((grade) => grade.id === id);
  if (gradeIndex < 0) {
    return { error: "Grade não encontrada." };
  }
  return res.json(gradesJsonGrades[gradeIndex]);
});

//5 - Nota Total por Aluno
app.get("/notas", async (req, res) => {
  const data = await totalNota(req.body);
  return res.json(data);
});

//6 - Média das Grades
app.get("/media", async (req, res) => {
  const data = await mediaGrade(req.body);
  return res.json(data);
});

//7 - Top 3 Grades
app.get("/top3", async (req, res) => {
  const data = await top3Grades(req.body);
  return res.json(data);
});

start();

module.exports = app;
