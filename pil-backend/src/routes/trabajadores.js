// Rutas del módulo Personal: registrar, modificar, consultar y buscar trabajadores
const express = require("express");
const db = require("../db/database");

const router = express.Router();

// Listar todos los trabajadores, con búsqueda opcional por nombre, área o cargo
// GET /api/trabajadores?buscar=texto
router.get("/", (req, res) => {
  const { buscar } = req.query;

  let trabajadores;
  if (buscar) {
    const texto = `%${buscar}%`;
    trabajadores = db.prepare(`
      SELECT * FROM trabajadores
      WHERE nombre LIKE ? OR apellido LIKE ? OR area LIKE ? OR cargo LIKE ?
      ORDER BY apellido, nombre
    `).all(texto, texto, texto, texto);
  } else {
    trabajadores = db.prepare("SELECT * FROM trabajadores ORDER BY apellido, nombre").all();
  }

  res.json(trabajadores);
});

// Consultar un trabajador por id (incluye su historial de asistencia reciente)
// GET /api/trabajadores/:id
router.get("/:id", (req, res) => {
  const trabajador = db.prepare("SELECT * FROM trabajadores WHERE id = ?").get(req.params.id);

  if (!trabajador) {
    return res.status(404).json({ error: "Trabajador no encontrado" });
  }

  res.json(trabajador);
});

// Registrar un nuevo trabajador
// POST /api/trabajadores
router.post("/", (req, res) => {
  const {
    nombre, apellido, ci, fecha_nacimiento, telefono, direccion,
    correo, cargo, area, fecha_ingreso, tipo_contrato, id_supervisor
  } = req.body;

  if (!nombre || !apellido || !ci) {
    return res.status(400).json({ error: "nombre, apellido y ci son obligatorios" });
  }

  try {
    const resultado = db.prepare(`
      INSERT INTO trabajadores
        (nombre, apellido, ci, fecha_nacimiento, telefono, direccion, correo, cargo, area, fecha_ingreso, tipo_contrato, id_supervisor, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo')
    `).run(
      nombre, apellido, ci, fecha_nacimiento || null, telefono || null, direccion || null,
      correo || null, cargo || null, area || null, fecha_ingreso || null, tipo_contrato || null,
      id_supervisor || null
    );

    const nuevo = db.prepare("SELECT * FROM trabajadores WHERE id = ?").get(resultado.lastInsertRowid);
    res.status(201).json(nuevo);
  } catch (err) {
    if (err.message && err.message.includes("UNIQUE constraint failed")) {
      return res.status(409).json({ error: "Ya existe un trabajador con ese CI" });
    }
    res.status(500).json({ error: "Error al registrar el trabajador" });
  }
});

// Modificar información de un trabajador existente
// PUT /api/trabajadores/:id
router.put("/:id", (req, res) => {
  const existente = db.prepare("SELECT * FROM trabajadores WHERE id = ?").get(req.params.id);
  if (!existente) {
    return res.status(404).json({ error: "Trabajador no encontrado" });
  }

  const datos = { ...existente, ...req.body };

  db.prepare(`
    UPDATE trabajadores SET
      nombre = ?, apellido = ?, ci = ?, fecha_nacimiento = ?, telefono = ?, direccion = ?,
      correo = ?, cargo = ?, area = ?, fecha_ingreso = ?, tipo_contrato = ?, id_supervisor = ?, estado = ?
    WHERE id = ?
  `).run(
    datos.nombre, datos.apellido, datos.ci, datos.fecha_nacimiento, datos.telefono, datos.direccion,
    datos.correo, datos.cargo, datos.area, datos.fecha_ingreso, datos.tipo_contrato, datos.id_supervisor,
    datos.estado, req.params.id
  );

  const actualizado = db.prepare("SELECT * FROM trabajadores WHERE id = ?").get(req.params.id);
  res.json(actualizado);
});

// Dar de baja a un trabajador (baja lógica, no se borra el registro)
// DELETE /api/trabajadores/:id
router.delete("/:id", (req, res) => {
  const existente = db.prepare("SELECT * FROM trabajadores WHERE id = ?").get(req.params.id);
  if (!existente) {
    return res.status(404).json({ error: "Trabajador no encontrado" });
  }

  db.prepare("UPDATE trabajadores SET estado = 'inactivo' WHERE id = ?").run(req.params.id);
  res.json({ mensaje: "Trabajador dado de baja (baja lógica)" });
});

module.exports = router;
