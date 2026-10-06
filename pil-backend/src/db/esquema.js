// Esquema de la base de datos: única fuente de verdad de las tablas.
// Cada fase del plan agrega aquí las tablas de su módulo.

// Orden de creación (respeta las FK). El seed las borra en orden inverso.
const TABLAS = [
  "trabajadores",
  "usuarios",
  "sesiones",
  "configuracion",
  "archivos",
  "notificaciones",
  "asistencia",
  "solicitudes"
];

function crearEsquema(db) {
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
      estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
      FOREIGN KEY (id_supervisor) REFERENCES trabajadores(id)
    );

    -- Cuenta de acceso: todo usuario es un trabajador (relación 1 a 1)
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_trabajador INTEGER NOT NULL UNIQUE,
      usuario TEXT NOT NULL UNIQUE,
      hash_clave TEXT NOT NULL,
      sal TEXT NOT NULL,
      rol TEXT NOT NULL CHECK (rol IN ('trabajador', 'supervisor', 'rrhh', 'gerencia')),
      activo INTEGER NOT NULL DEFAULT 1 CHECK (activo IN (0, 1)),
      debe_cambiar_clave INTEGER NOT NULL DEFAULT 1 CHECK (debe_cambiar_clave IN (0, 1)),
      FOREIGN KEY (id_trabajador) REFERENCES trabajadores(id)
    );

    -- Se guarda el hash SHA-256 del token, nunca el token en claro
    CREATE TABLE IF NOT EXISTS sesiones (
      hash_token TEXT PRIMARY KEY,
      id_usuario INTEGER NOT NULL,
      expira TEXT NOT NULL,
      FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
    );

    CREATE TABLE IF NOT EXISTS configuracion (
      clave TEXT PRIMARY KEY,
      valor TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS archivos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre_original TEXT NOT NULL,
      ruta TEXT NOT NULL,
      mime TEXT NOT NULL,
      tamano INTEGER NOT NULL,
      id_subido_por INTEGER NOT NULL,
      fecha TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (id_subido_por) REFERENCES usuarios(id)
    );

    CREATE TABLE IF NOT EXISTS notificaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_usuario INTEGER NOT NULL,
      tipo TEXT NOT NULL,
      mensaje TEXT NOT NULL,
      enlace TEXT,
      leida INTEGER NOT NULL DEFAULT 0 CHECK (leida IN (0, 1)),
      fecha TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
    );
    CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(id_usuario, leida);

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

  // Valores de configuración por defecto (no pisa los que ya existan)
  const insertarConfig = db.prepare("INSERT OR IGNORE INTO configuracion (clave, valor) VALUES (?, ?)");
  insertarConfig.run("tolerancia_minutos", "10");
}

module.exports = { TABLAS, crearEsquema };
