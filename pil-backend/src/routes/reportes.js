// Ruta de Reportes: NO es un módulo con tabla propia, sino una vista que agrega
// datos de trabajadores, asistencia y solicitudes para indicadores de gestión.
const express = require("express");
const db = require("../db/database");
const { hoyLocal } = require("../utils/fechas");

const router = express.Router();

function mesActual() {
  return hoyLocal().slice(0, 7); // YYYY-MM
}

function fechaHoy() {
  return hoyLocal(); // YYYY-MM-DD en hora local
}

// GET /api/reportes/resumen
router.get("/resumen", (req, res) => {
  const mes = req.query.mes || mesActual();
  const hoy = fechaHoy();

  const totalActivos = db.prepare(
    "SELECT COUNT(*) AS total FROM trabajadores WHERE estado = 'activo'"
  ).get().total;

  const asistenciasHoy = db.prepare(
    "SELECT COUNT(*) AS total FROM asistencia WHERE fecha = ?"
  ).get(hoy).total;

  const ausentesHoy = Math.max(totalActivos - asistenciasHoy, 0);

  const retrasosMes = db.prepare(
    "SELECT COUNT(*) AS total FROM asistencia WHERE minutos_retraso > 0 AND fecha LIKE ?"
  ).get(`${mes}%`).total;

  const promedioHorasMes = db.prepare(
    "SELECT AVG(horas_trabajadas) AS promedio FROM asistencia WHERE fecha LIKE ? AND horas_trabajadas IS NOT NULL"
  ).get(`${mes}%`).promedio;

  // Los tres estados pendientes (supervisor, RRHH, Gerencia) se agrupan como "pendiente"
  const solicitudesPorEstado = db.prepare(`
    SELECT CASE WHEN estado LIKE 'pendiente%' THEN 'pendiente' ELSE estado END AS estado, COUNT(*) AS total
    FROM solicitudes GROUP BY 1
  `).all();

  const estados = { pendiente: 0, aprobado: 0, rechazado: 0, cancelado: 0 };
  solicitudesPorEstado.forEach((fila) => { estados[fila.estado] = fila.total; });

  res.json({
    mes,
    fecha_hoy: hoy,
    personal: {
      total_activos: totalActivos
    },
    asistencia: {
      registrados_hoy: asistenciasHoy,
      ausentes_hoy: ausentesHoy,
      retrasos_mes: retrasosMes,
      promedio_horas_mes: promedioHorasMes ? Math.round(promedioHorasMes * 100) / 100 : 0
    },
    solicitudes: {
      por_estado: estados,
      total: Object.values(estados).reduce((a, b) => a + b, 0)
    }
  });
});

module.exports = router;
