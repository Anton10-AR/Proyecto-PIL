// Esquema de la base de datos: única fuente de verdad de las tablas.
// Cada fase del plan agrega aquí las tablas de su módulo.
// Las fechas que ve el usuario se guardan en hora local (datetime('now', 'localtime'));
// solo sesiones.expira usa UTC, y se compara siempre contra datetime('now').

// Orden de creación (respeta las FK). El seed las borra en orden inverso.
const TABLAS = [
  "trabajadores",
  "usuarios",
  "sesiones",
  "configuracion",
  "archivos",
  "notificaciones",
  "turnos",
  "asignaciones_turno",
  "feriados",
  "asistencia",
  "ausencias",
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
      fecha TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (id_subido_por) REFERENCES usuarios(id)
    );

    CREATE TABLE IF NOT EXISTS notificaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_usuario INTEGER NOT NULL,
      tipo TEXT NOT NULL,
      mensaje TEXT NOT NULL,
      enlace TEXT,
      leida INTEGER NOT NULL DEFAULT 0 CHECK (leida IN (0, 1)),
      fecha TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
    );
    CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(id_usuario, leida);

    -- Turnos fijos definidos por RRHH. Sin turnos nocturnos: fin siempre después del inicio.
    -- dias_laborables: días ISO separados por coma (1 = lunes ... 7 = domingo), ej. "1,2,3,4,5"
    CREATE TABLE IF NOT EXISTS turnos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE,
      hora_inicio TEXT NOT NULL,
      hora_fin TEXT NOT NULL,
      dias_laborables TEXT NOT NULL,
      activo INTEGER NOT NULL DEFAULT 1 CHECK (activo IN (0, 1)),
      CHECK (hora_fin > hora_inicio)
    );

    -- Historial de turnos de cada trabajador. La asignación vigente es la de fecha_hasta NULL.
    CREATE TABLE IF NOT EXISTS asignaciones_turno (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_trabajador INTEGER NOT NULL,
      id_turno INTEGER NOT NULL,
      fecha_desde TEXT NOT NULL,
      fecha_hasta TEXT,
      id_asignado_por INTEGER,
      CHECK (fecha_hasta IS NULL OR fecha_hasta >= fecha_desde),
      FOREIGN KEY (id_trabajador) REFERENCES trabajadores(id),
      FOREIGN KEY (id_turno) REFERENCES turnos(id),
      FOREIGN KEY (id_asignado_por) REFERENCES usuarios(id)
    );
    -- Un solo turno vigente (abierto) por trabajador
    CREATE UNIQUE INDEX IF NOT EXISTS idx_asignacion_abierta
      ON asignaciones_turno(id_trabajador) WHERE fecha_hasta IS NULL;

    CREATE TABLE IF NOT EXISTS feriados (
      fecha TEXT PRIMARY KEY,
      descripcion TEXT NOT NULL
    );

    -- Una marcación por trabajador y día. id_turno NULL = marcación fuera de turno
    -- (sin turno, día no laborable o feriado): en ese caso minutos_retraso también es NULL.
    CREATE TABLE IF NOT EXISTS asistencia (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_trabajador INTEGER NOT NULL,
      fecha TEXT NOT NULL,
      hora_entrada TEXT NOT NULL,
      hora_salida TEXT,
      id_turno INTEGER,
      minutos_retraso INTEGER CHECK (minutos_retraso IS NULL OR minutos_retraso >= 0),
      horas_trabajadas REAL,
      observacion TEXT,
      id_corregido_por INTEGER,
      fecha_correccion TEXT,
      UNIQUE (id_trabajador, fecha),
      CHECK (hora_salida IS NULL OR hora_salida > hora_entrada),
      FOREIGN KEY (id_trabajador) REFERENCES trabajadores(id),
      FOREIGN KEY (id_turno) REFERENCES turnos(id),
      FOREIGN KEY (id_corregido_por) REFERENCES usuarios(id)
    );

    -- Ausencias registradas manualmente por RRHH
    CREATE TABLE IF NOT EXISTS ausencias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_trabajador INTEGER NOT NULL,
      fecha TEXT NOT NULL,
      justificada INTEGER NOT NULL DEFAULT 0 CHECK (justificada IN (0, 1)),
      motivo TEXT,
      id_registrado_por INTEGER NOT NULL,
      fecha_registro TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      UNIQUE (id_trabajador, fecha),
      FOREIGN KEY (id_trabajador) REFERENCES trabajadores(id),
      FOREIGN KEY (id_registrado_por) REFERENCES usuarios(id)
    );

    CREATE TABLE IF NOT EXISTS solicitudes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_trabajador INTEGER NOT NULL,
      tipo TEXT NOT NULL CHECK (tipo IN ('permiso', 'vacacion')),
      fecha_inicio TEXT NOT NULL,
      fecha_fin TEXT NOT NULL,
      motivo TEXT,
      estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','aprobado','rechazado','cancelado')),
      fecha_solicitud TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
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
