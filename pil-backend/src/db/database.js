// Conexión a SQLite y creación de tablas (se ejecuta una sola vez al arrancar el servidor)
// Usa el módulo nativo de Node.js (node:sqlite), disponible desde Node 22 sin instalar nada más.
const { DatabaseSync } = require("node:sqlite");
const path = require("path");

const dbPath = path.join(__dirname, "..", "..", "pil_rrhh.db");
const db = new DatabaseSync(dbPath);

db.exec("PRAGMA foreign_keys = ON;");

db.exec(`
  CREATE TABLE IF NOT EXISTS trabajadores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    ci TEXT NOT NULL UNIQUE,
    fecha_nacimiento TEXT,
    telefono TEXT,
    direccion TEXT,
    correo TEXT,
    cargo TEXT,
    area TEXT,
    fecha_ingreso TEXT,
    tipo_contrato TEXT,
    id_supervisor INTEGER,
    estado TEXT NOT NULL DEFAULT 'activo',
    FOREIGN KEY (id_supervisor) REFERENCES trabajadores(id)
  );

  CREATE TABLE IF NOT EXISTS asistencia (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_trabajador INTEGER NOT NULL,
    fecha TEXT NOT NULL,
    hora_entrada TEXT,
    hora_salida TEXT,
    retraso INTEGER NOT NULL DEFAULT 0,
    horas_trabajadas REAL,
    FOREIGN KEY (id_trabajador) REFERENCES trabajadores(id)
  );

  CREATE TABLE IF NOT EXISTS solicitudes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_trabajador INTEGER NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('permiso', 'vacacion')),
    fecha_inicio TEXT NOT NULL,
    fecha_fin TEXT NOT NULL,
    motivo TEXT,
    estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','aprobado','rechazado','cancelado')),
    fecha_solicitud TEXT NOT NULL DEFAULT (datetime('now')),
    id_aprobador INTEGER,
    FOREIGN KEY (id_trabajador) REFERENCES trabajadores(id),
    FOREIGN KEY (id_aprobador) REFERENCES trabajadores(id)
  );
`);

module.exports = db;
