// Script de carga de datos de ejemplo, útil para la demo del prototipo.
// Uso: node src/seed.js
const db = require("./db/database");

function limpiarTablas() {
  db.exec("DELETE FROM solicitudes;");
  db.exec("DELETE FROM asistencia;");
  db.exec("DELETE FROM trabajadores;");
  db.exec("DELETE FROM sqlite_sequence WHERE name IN ('trabajadores','asistencia','solicitudes');");
}

function fechaHace(diasAtras) {
  const f = new Date();
  f.setDate(f.getDate() - diasAtras);
  return f.toISOString().slice(0, 10);
}

console.log("Limpiando tablas...");
limpiarTablas();

console.log("Insertando trabajadores...");
const insertarTrabajador = db.prepare(`
  INSERT INTO trabajadores (nombre, apellido, ci, cargo, area, fecha_ingreso, tipo_contrato, telefono, correo, id_supervisor, estado)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const trabajadores = [
  ["Ana", "Rojas", "4521301", "Jefa de Producción", "Producción", "2019-03-10", "Indefinido", "70011111", "arojas@pilandina.bo", null, "activo"],
  ["Juan", "Perez", "5891023", "Operario", "Producción", "2022-06-01", "Indefinido", "70011112", "jperez@pilandina.bo", 1, "activo"],
  ["Maria", "Lopez", "3341987", "Operaria", "Producción", "2023-01-15", "Plazo fijo", "70011113", "mlopez@pilandina.bo", 1, "activo"],
  ["Luis", "Mamani", "6672310", "Supervisor de Calidad", "Calidad", "2018-11-20", "Indefinido", "70011114", "lmamani@pilandina.bo", null, "activo"],
  ["Rosa", "Choque", "2219876", "Analista de Calidad", "Calidad", "2021-09-05", "Indefinido", "70011115", "rchoque@pilandina.bo", 4, "activo"],
  ["Carlos", "Vargas", "7783456", "Chofer", "Logística", "2020-02-14", "Indefinido", "70011116", "cvargas@pilandina.bo", null, "activo"],
  ["Elena", "Fernandez", "1109988", "Asistente de RRHH", "Recursos Humanos", "2024-04-01", "Plazo fijo", "70011117", "efernandez@pilandina.bo", null, "activo"],
  ["Pedro", "Quispe", "8890123", "Operario", "Producción", "2017-07-22", "Indefinido", "70011118", "pquispe@pilandina.bo", 1, "inactivo"]
];

trabajadores.forEach((t) => insertarTrabajador.run(...t));

console.log("Insertando asistencia (últimos 5 días hábiles, trabajadores activos)...");
const insertarAsistencia = db.prepare(`
  INSERT INTO asistencia (id_trabajador, fecha, hora_entrada, hora_salida, retraso, horas_trabajadas)
  VALUES (?, ?, ?, ?, ?, ?)
`);

// ids activos: 1 a 7 (8 quedó inactivo y no marca asistencia)
const idsActivos = [1, 2, 3, 4, 5, 6, 7];
const patronesEntrada = {
  1: "08:15", 2: "08:45", 3: "08:20", 4: "08:10", 5: "08:35", 6: "07:55", 7: "08:25"
};

for (let dia = 4; dia >= 0; dia--) {
  const fecha = fechaHace(dia);
  idsActivos.forEach((id) => {
    // Simula un par de ausencias e imprevistos para que el reporte tenga variedad
    if (id === 6 && dia === 2) return; // Carlos faltó ese día
    if (id === 5 && dia === 0) return; // Rosa aún no marcó entrada hoy

    const horaEntrada = patronesEntrada[id];
    const retraso = horaEntrada > "08:30" ? 1 : 0;

    // El día de hoy (dia === 0) no siempre tiene hora de salida todavía
    const marcarSalida = !(dia === 0 && (id === 2 || id === 4));
    const horaSalida = marcarSalida ? "17:00" : null;
    const horas = marcarSalida ? 8.5 : null;

    insertarAsistencia.run(id, fecha, horaEntrada, horaSalida, retraso, horas);
  });
}

console.log("Insertando solicitudes (variadas en tipo y estado)...");
const insertarSolicitud = db.prepare(`
  INSERT INTO solicitudes (id_trabajador, tipo, fecha_inicio, fecha_fin, motivo, estado, id_aprobador)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const solicitudes = [
  [2, "vacacion", "2026-10-01", "2026-10-10", "Vacación anual", "aprobado", 1],
  [3, "permiso", "2026-09-18", "2026-09-18", "Trámite personal", "pendiente", null],
  [5, "permiso", "2026-09-20", "2026-09-20", "Cita médica", "aprobado", 4],
  [6, "vacacion", "2026-11-05", "2026-11-15", "Vacación anual", "pendiente", null],
  [7, "permiso", "2026-09-10", "2026-09-10", "Asunto familiar", "rechazado", null],
  [2, "permiso", "2026-08-20", "2026-08-20", "Trámite bancario", "cancelado", null]
];

solicitudes.forEach((s) => insertarSolicitud.run(...s));

console.log("Listo. Datos de ejemplo cargados:");
console.log(`- ${trabajadores.length} trabajadores (1 inactivo)`);
console.log("- 5 días de asistencia para los trabajadores activos, con retrasos y ausencias simuladas");
console.log(`- ${solicitudes.length} solicitudes en distintos estados`);
