// Funciones para comunicarse con la API del backend (Node/Express)
const BASE_URL = "http://localhost:3000/api";

async function manejarRespuesta(res) {
  const datos = await res.json();
  if (!res.ok) {
    throw new Error(datos.error || "Error en la solicitud");
  }
  return datos;
}

// --- Trabajadores (Personal) ---
export function listarTrabajadores(buscar = "") {
  const query = buscar ? `?buscar=${encodeURIComponent(buscar)}` : "";
  return fetch(`${BASE_URL}/trabajadores${query}`).then(manejarRespuesta);
}

export function crearTrabajador(datos) {
  return fetch(`${BASE_URL}/trabajadores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  }).then(manejarRespuesta);
}

export function actualizarTrabajador(id, datos) {
  return fetch(`${BASE_URL}/trabajadores/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  }).then(manejarRespuesta);
}

export function darDeBajaTrabajador(id) {
  return fetch(`${BASE_URL}/trabajadores/${id}`, { method: "DELETE" }).then(manejarRespuesta);
}

// --- Asistencia ---
export function registrarEntrada(datos) {
  return fetch(`${BASE_URL}/asistencia`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  }).then(manejarRespuesta);
}

export function registrarSalida(id, hora_salida) {
  return fetch(`${BASE_URL}/asistencia/${id}/salida`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hora_salida })
  }).then(manejarRespuesta);
}

export function consultarAsistencia({ trabajador, fecha, mes } = {}) {
  const params = new URLSearchParams();
  if (trabajador) params.set("trabajador", trabajador);
  if (fecha) params.set("fecha", fecha);
  if (mes) params.set("mes", mes);
  const query = params.toString() ? `?${params.toString()}` : "";
  return fetch(`${BASE_URL}/asistencia${query}`).then(manejarRespuesta);
}

// --- Reportes (vista integrada, no tabla propia) ---
export function obtenerResumenReportes(mes) {
  const query = mes ? `?mes=${mes}` : "";
  return fetch(`${BASE_URL}/reportes/resumen${query}`).then(manejarRespuesta);
}

// --- Solicitudes ---
export function crearSolicitud(datos) {
  return fetch(`${BASE_URL}/solicitudes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  }).then(manejarRespuesta);
}

export function listarSolicitudes({ trabajador, estado } = {}) {
  const params = new URLSearchParams();
  if (trabajador) params.set("trabajador", trabajador);
  if (estado) params.set("estado", estado);
  const query = params.toString() ? `?${params.toString()}` : "";
  return fetch(`${BASE_URL}/solicitudes${query}`).then(manejarRespuesta);
}

export function cambiarEstadoSolicitud(id, estado, id_aprobador) {
  return fetch(`${BASE_URL}/solicitudes/${id}/estado`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado, id_aprobador })
  }).then(manejarRespuesta);
}
