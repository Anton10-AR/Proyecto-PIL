// Script de carga de datos de ejemplo, útil para la demo del prototipo.
// Uso: node src/seed.js
const db = require("./db/database");
const { TABLAS, crearEsquema } = require("./db/esquema");
const { hashearClave } = require("./utils/claves");
const { hoyLocal, sumarDias, diaSemana, minutosDelDia, calcularHoras, calcularRetraso } = require("./utils/fechas");
const { jornadaDelDia, toleranciaMinutos } = require("./utils/jornada");

// Recrea el esquema desde cero: así los cambios de esquema de cada fase se aplican al correr el seed
function recrearEsquema() {
  db.exec("PRAGMA foreign_keys = OFF;");
  [...TABLAS].reverse().forEach((tabla) => db.exec(`DROP TABLE IF EXISTS ${tabla};`));
  db.exec("PRAGMA foreign_keys = ON;");
  crearEsquema(db);
}

console.log("Recreando el esquema...");
recrearEsquema();

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
  ["Pedro", "Quispe", "8890123", "Operario", "Producción", "2017-07-22", "Indefinido", "70011118", "pquispe@pilandina.bo", 1, "inactivo"],
  ["Jorge", "Salinas", "3456789", "Gerente General", "Gerencia", "2015-01-05", "Indefinido", "70011119", "jsalinas@pilandina.bo", null, "activo"]
];

trabajadores.forEach((t) => insertarTrabajador.run(...t));

console.log("Creando cuentas de usuario (una por rol como mínimo)...");
const insertarUsuario = db.prepare(`
  INSERT INTO usuarios (id_trabajador, usuario, hash_clave, sal, rol, debe_cambiar_clave)
  VALUES (?, ?, ?, ?, ?, ?)
`);

// [id_trabajador, usuario, rol, debe_cambiar_clave]. La contraseña inicial es el CI.
// mlopez queda con cambio obligatorio para poder demostrar ese flujo.
const cuentas = [
  [1, "arojas", "supervisor", 0],
  [2, "jperez", "trabajador", 0],
  [3, "mlopez", "trabajador", 1],
  [4, "lmamani", "supervisor", 0],
  [5, "rchoque", "trabajador", 0],
  [6, "cvargas", "trabajador", 0],
  [7, "efernandez", "rrhh", 0],
  [9, "jsalinas", "gerencia", 0]
];

cuentas.forEach(([idTrabajador, usuario, rol, debeCambiar]) => {
  const ci = trabajadores[idTrabajador - 1][2];
  const { hash, sal } = hashearClave(ci);
  insertarUsuario.run(idTrabajador, usuario, hash, sal, rol, debeCambiar);
});

db.prepare(`
  INSERT INTO notificaciones (id_usuario, tipo, mensaje, enlace)
  SELECT id, 'bienvenida', 'Bienvenido al nuevo Sistema de RR.HH. de PIL Andina', '/' FROM usuarios
`).run();

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

console.log("Insertando turnos, feriados y asignaciones...");
const insertarTurno = db.prepare(
  "INSERT INTO turnos (nombre, hora_inicio, hora_fin, dias_laborables) VALUES (?, ?, ?, ?)"
);
const turnos = [
  ["Mañana", "06:00", "14:00", "1,2,3,4,5,6"],        // id 1: planta, lunes a sábado
  ["Tarde", "14:00", "22:00", "1,2,3,4,5,6"],         // id 2: planta, lunes a sábado
  ["Administrativo", "08:30", "17:30", "1,2,3,4,5"]   // id 3: oficinas, lunes a viernes
];
turnos.forEach((t) => insertarTurno.run(...t));

// Feriados nacionales de Bolivia (2026 y comienzo de 2027), editables por RRHH
const feriados = [
  ["2026-01-01", "Año Nuevo"], ["2026-01-22", "Día del Estado Plurinacional"],
  ["2026-02-16", "Carnaval"], ["2026-02-17", "Carnaval"], ["2026-04-03", "Viernes Santo"],
  ["2026-05-01", "Día del Trabajo"], ["2026-06-04", "Corpus Christi"],
  ["2026-06-21", "Año Nuevo Andino Amazónico"], ["2026-08-06", "Día de la Independencia"],
  ["2026-11-02", "Día de Todos los Difuntos"], ["2026-12-25", "Navidad"],
  ["2027-01-01", "Año Nuevo"], ["2027-01-22", "Día del Estado Plurinacional"]
];
const insertarFeriado = db.prepare("INSERT INTO feriados (fecha, descripcion) VALUES (?, ?)");
feriados.forEach((f) => insertarFeriado.run(...f));

// [id_trabajador, id_turno, fecha_desde, fecha_hasta]
const asignaciones = [
  [1, 3, "2026-01-01", null], [2, 1, "2026-01-01", "2026-06-30"], [2, 2, "2026-07-01", null],
  [3, 1, "2026-01-01", null], [4, 3, "2026-01-01", null], [5, 3, "2026-01-01", null],
  [6, 1, "2026-01-01", null], [7, 3, "2026-01-01", null], [9, 3, "2026-01-01", null],
  [8, 1, "2026-01-01", "2026-03-31"]
];
const insertarAsignacion = db.prepare(`
  INSERT INTO asignaciones_turno (id_trabajador, id_turno, fecha_desde, fecha_hasta, id_asignado_por)
  VALUES (?, ?, ?, ?, 7)
`);
asignaciones.forEach((a) => insertarAsignacion.run(...a));

console.log("Insertando asistencia y ausencias de las últimas dos semanas...");
const insertarAsistencia = db.prepare(`
  INSERT INTO asistencia (id_trabajador, fecha, hora_entrada, hora_salida, id_turno, minutos_retraso, horas_trabajadas)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);
const insertarAusencia = db.prepare(`
  INSERT INTO ausencias (id_trabajador, fecha, justificada, motivo, id_registrado_por) VALUES (?, ?, ?, ?, 7)
`);

const hoy = hoyLocal();
const tolerancia = toleranciaMinutos();
const enVacacionAprobada = (id, fecha) => solicitudes.some(
  ([idT, , desde, hasta, , estado]) => idT === id && estado === "aprobado" && desde <= fecha && fecha <= hasta
);
// Variación determinista para que cada corrida del seed genere los mismos datos relativos
const variacion = (id, dias, rango) => (id * 37 + dias * 17) % rango;
const sumarMinutos = (hora, minutos) => {
  const total = minutosDelDia(hora) + minutos;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

let totalAsistencia = 0;
let totalAusencias = 0;
for (let dias = 13; dias >= 0; dias--) {
  const fecha = sumarDias(hoy, -dias);
  [1, 2, 3, 4, 5, 6, 7, 9].forEach((id) => {
    const { turno, laborable } = jornadaDelDia(id, fecha);
    if (!laborable || enVacacionAprobada(id, fecha)) return;

    // Algunas ausencias registradas por RRHH para que los reportes tengan variedad
    if (id === 6 && dias === 8) {
      insertarAusencia.run(id, fecha, 0, "No se presentó ni avisó");
      totalAusencias++;
      return;
    }
    if (id === 5 && dias === 4) {
      insertarAusencia.run(id, fecha, 1, "Reposo médico (presentó certificado)");
      totalAusencias++;
      return;
    }
    // Hoy, el turno de la tarde todavía no empezó y Rosa aún no marcó
    if (dias === 0 && (turno.hora_inicio > "12:00" || id === 5)) return;

    // Entrada entre 12 min antes y 17 min después del inicio: algunas caen fuera de la tolerancia
    const entrada = sumarMinutos(turno.hora_inicio, variacion(id, dias, 30) - 12);
    const salida = dias === 0 ? null : sumarMinutos(turno.hora_fin, variacion(id, dias, 25));
    insertarAsistencia.run(
      id, fecha, entrada, salida, turno.id,
      calcularRetraso(entrada, turno.hora_inicio, tolerancia),
      salida ? calcularHoras(entrada, salida) : null
    );
    totalAsistencia++;
  });
}

// Una marcación fuera de turno: Carlos trabajó el domingo pasado
const domingo = sumarDias(hoy, -((diaSemana(hoy) % 7) || 7));
insertarAsistencia.run(6, domingo, "07:00", "11:00", null, null, calcularHoras("07:00", "11:00"));
totalAsistencia++;

console.log("Listo. Datos de ejemplo cargados:");
console.log(`- ${trabajadores.length} trabajadores (1 inactivo)`);
console.log(`- ${cuentas.length} cuentas de usuario. Contraseña inicial = CI del trabajador:`);
cuentas.forEach(([idTrabajador, usuario, rol]) => {
  console.log(`    ${usuario.padEnd(11)} ${rol.padEnd(10)} clave: ${trabajadores[idTrabajador - 1][2]}`);
});
console.log(`- ${turnos.length} turnos, ${feriados.length} feriados y ${asignaciones.length} asignaciones de turno`);
console.log(`- ${totalAsistencia} marcaciones de asistencia y ${totalAusencias} ausencias (últimas dos semanas)`);
console.log(`- ${solicitudes.length} solicitudes en distintos estados`);
