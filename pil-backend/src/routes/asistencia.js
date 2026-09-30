// Rutas del módulo Asistencia: registrar entrada/salida, calcular horas y retrasos, consultas
const express = require("express");
const db = require("../db/database");

const router = express.Router();

const HORA_ENTRADA_ESPERADA = "08:30"; // referencia simple para calcular retraso en el prototipo

function calcularHoras(horaEntrada, horaSalida) {
  const [he, me] = horaEntrada.split(":").map(Number);
  const [hs, ms] = horaSalida.split(":").map(Number);
  const minutosTotales = (hs * 60 + ms) - (he * 60 + me);
  return Math.round((minutosTotales / 60) * 100) / 100; // horas con 2 decimales
}

function esRetraso(horaEntrada) {
  return horaEntrada > HORA_ENTRADA_ESPERADA ? 1 : 0;
}

// Registrar la entrada de un trabajador (crea el registro del día)
// POST /api/asistencia
router.post("/", (req, res) => {
  const { id_trabajador, fecha, hora_entrada } = req.body;

  if (!id_trabajador || !fecha || !hora_entrada) {
    return res.status(400).json({ error: "id_trabajador, fecha y hora_entrada son obligatorios" });
  }

  const trabajador = db.prepare("SELECT id FROM trabajadores WHERE id = ?").get(id_trabajador);
  if (!trabajador) {
    return res.status(404).json({ error: "Trabajador no encontrado" });
  }

  const yaRegistrado = db.prepare(
    "SELECT id FROM asistencia WHERE id_trabajador = ? AND fecha = ?"
  ).get(id_trabajador, fecha);
  if (yaRegistrado) {
    return res.status(409).json({ error: "Ya existe un registro de asistencia para ese trabajador en esa fecha" });
  }

  const retraso = esRetraso(hora_entrada);

  const resultado = db.prepare(`
    INSERT INTO asistencia (id_trabajador, fecha, hora_entrada, retraso)
    VALUES (?, ?, ?, ?)
  `).run(id_trabajador, fecha, hora_entrada, retraso);

  const nuevo = db.prepare("SELECT * FROM asistencia WHERE id = ?").get(resultado.lastInsertRowid);
  res.status(201).json(nuevo);
});

// Registrar la salida de un trabajador (calcula horas trabajadas)
// PUT /api/asistencia/:id/salida
router.put("/:id/salida", (req, res) => {
  const { hora_salida } = req.body;
  if (!hora_salida) {
    return res.status(400).json({ error: "hora_salida es obligatoria" });
  }

  const registro = db.prepare("SELECT * FROM asistencia WHERE id = ?").get(req.params.id);
  if (!registro) {
    return res.status(404).json({ error: "Registro de asistencia no encontrado" });
  }

  const horasTrabajadas = calcularHoras(registro.hora_entrada, hora_salida);

  db.prepare(`
    UPDATE asistencia SET hora_salida = ?, horas_trabajadas = ? WHERE id = ?
  `).run(hora_salida, horasTrabajadas, req.params.id);

  const actualizado = db.prepare("SELECT * FROM asistencia WHERE id = ?").get(req.params.id);
  res.json(actualizado);
});

// Consultar asistencia: por trabajador, por fecha exacta, o por mes (YYYY-MM)
// GET /api/asistencia?trabajador=1&fecha=2026-09-12
// GET /api/asistencia?trabajador=1&mes=2026-09
router.get("/", (req, res) => {
  const { trabajador, fecha, mes } = req.query;

  let sql = "SELECT * FROM asistencia WHERE 1=1";
  const params = [];

  if (trabajador) {
    sql += " AND id_trabajador = ?";
    params.push(trabajador);
  }
  if (fecha) {
    sql += " AND fecha = ?";
    params.push(fecha);
  }
  if (mes) {
    sql += " AND fecha LIKE ?";
    params.push(`${mes}%`);
  }
  sql += " ORDER BY fecha DESC";

  const registros = db.prepare(sql).all(...params);
  res.json(registros);
});

module.exports = router;
