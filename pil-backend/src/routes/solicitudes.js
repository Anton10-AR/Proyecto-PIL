// Rutas del módulo Solicitudes: crear, aprobar/rechazar/cancelar, consultar historial
const express = require("express");
const db = require("../db/database");

const router = express.Router();

// Crear una nueva solicitud (permiso o vacación) - queda en estado 'pendiente'
// POST /api/solicitudes
router.post("/", (req, res) => {
  const { id_trabajador, tipo, fecha_inicio, fecha_fin, motivo } = req.body;

  if (!id_trabajador || !tipo || !fecha_inicio || !fecha_fin) {
    return res.status(400).json({ error: "id_trabajador, tipo, fecha_inicio y fecha_fin son obligatorios" });
  }
  if (!["permiso", "vacacion"].includes(tipo)) {
    return res.status(400).json({ error: "tipo debe ser 'permiso' o 'vacacion'" });
  }

  const trabajador = db.prepare("SELECT id FROM trabajadores WHERE id = ?").get(id_trabajador);
  if (!trabajador) {
    return res.status(404).json({ error: "Trabajador no encontrado" });
  }

  const resultado = db.prepare(`
    INSERT INTO solicitudes (id_trabajador, tipo, fecha_inicio, fecha_fin, motivo, estado)
    VALUES (?, ?, ?, ?, ?, 'pendiente')
  `).run(id_trabajador, tipo, fecha_inicio, fecha_fin, motivo || null);

  const nueva = db.prepare("SELECT * FROM solicitudes WHERE id = ?").get(resultado.lastInsertRowid);
  res.status(201).json(nueva);
});

// Consultar solicitudes: por trabajador y/o por estado
// GET /api/solicitudes?trabajador=1&estado=pendiente
router.get("/", (req, res) => {
  const { trabajador, estado } = req.query;

  let sql = "SELECT * FROM solicitudes WHERE 1=1";
  const params = [];

  if (trabajador) {
    sql += " AND id_trabajador = ?";
    params.push(trabajador);
  }
  if (estado) {
    sql += " AND estado = ?";
    params.push(estado);
  }
  sql += " ORDER BY fecha_solicitud DESC";

  const solicitudes = db.prepare(sql).all(...params);
  res.json(solicitudes);
});

// Consultar una solicitud puntual
// GET /api/solicitudes/:id
router.get("/:id", (req, res) => {
  const solicitud = db.prepare("SELECT * FROM solicitudes WHERE id = ?").get(req.params.id);
  if (!solicitud) {
    return res.status(404).json({ error: "Solicitud no encontrada" });
  }
  res.json(solicitud);
});

// Cambiar el estado de una solicitud: aprobar, rechazar o cancelar
// PUT /api/solicitudes/:id/estado
// body: { estado: 'aprobado' | 'rechazado' | 'cancelado', id_aprobador }
router.put("/:id/estado", (req, res) => {
  const { estado, id_aprobador } = req.body;
  const estadosValidos = ["aprobado", "rechazado", "cancelado"];

  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ error: `estado debe ser uno de: ${estadosValidos.join(", ")}` });
  }

  const solicitud = db.prepare("SELECT * FROM solicitudes WHERE id = ?").get(req.params.id);
  if (!solicitud) {
    return res.status(404).json({ error: "Solicitud no encontrada" });
  }
  if (solicitud.estado !== "pendiente") {
    return res.status(409).json({ error: `La solicitud ya está en estado '${solicitud.estado}' y no puede modificarse` });
  }

  db.prepare(`
    UPDATE solicitudes SET estado = ?, id_aprobador = ? WHERE id = ?
  `).run(estado, id_aprobador || null, req.params.id);

  const actualizada = db.prepare("SELECT * FROM solicitudes WHERE id = ?").get(req.params.id);
  res.json(actualizada);
});

module.exports = router;
