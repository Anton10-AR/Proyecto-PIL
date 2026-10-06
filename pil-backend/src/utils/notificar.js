// Crea notificaciones dentro de la app (campana). Los módulos llaman a estas funciones
// cuando ocurre algo que el usuario debe saber (solicitud resuelta, cambio de turno, etc.).
const db = require("../db/database");

function notificarUsuario(idUsuario, tipo, mensaje, enlace = null) {
  db.prepare(`
    INSERT INTO notificaciones (id_usuario, tipo, mensaje, enlace) VALUES (?, ?, ?, ?)
  `).run(idUsuario, tipo, mensaje, enlace);
}

// Notifica a la cuenta de un trabajador (si tiene una activa)
function notificarTrabajador(idTrabajador, tipo, mensaje, enlace = null) {
  const usuario = db.prepare(
    "SELECT id FROM usuarios WHERE id_trabajador = ? AND activo = 1"
  ).get(idTrabajador);
  if (usuario) notificarUsuario(usuario.id, tipo, mensaje, enlace);
}

// Notifica a todos los usuarios activos de un rol (ej. avisar a RRHH de una solicitud por revisar)
function notificarRol(rol, tipo, mensaje, enlace = null, excluirIdUsuario = null) {
  db.prepare("SELECT id FROM usuarios WHERE rol = ? AND activo = 1")
    .all(rol)
    .filter((u) => u.id !== excluirIdUsuario)
    .forEach((u) => notificarUsuario(u.id, tipo, mensaje, enlace));
}

module.exports = { notificarUsuario, notificarTrabajador, notificarRol };
