// Formato de fechas para mostrar. Las fechas viajan como "YYYY-MM-DD" (hora local).
const DIAS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

export const NOMBRES_DIA_ISO = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

function dosDigitos(n) {
  return String(n).padStart(2, "0");
}

export function hoy() {
  const f = new Date();
  return `${f.getFullYear()}-${dosDigitos(f.getMonth() + 1)}-${dosDigitos(f.getDate())}`;
}

export function mesActual() {
  return hoy().slice(0, 7);
}

// "2026-10-06" -> "mar 06/10/2026"
export function fechaCorta(fecha) {
  if (!fecha) return "—";
  const [a, m, d] = fecha.split("-").map(Number);
  return `${DIAS[new Date(a, m - 1, d).getDay()]} ${dosDigitos(d)}/${dosDigitos(m)}/${a}`;
}

// Estados de una solicitud: etiqueta y clase de la insignia
export const ESTADOS_SOLICITUD = {
  pendiente_supervisor: { texto: "Pendiente del supervisor", clase: "insignia-pendiente" },
  pendiente_rrhh: { texto: "Pendiente de RRHH", clase: "insignia-pendiente" },
  pendiente_gerencia: { texto: "Pendiente de Gerencia", clase: "insignia-pendiente" },
  aprobado: { texto: "Aprobada", clase: "insignia-activo" },
  rechazado: { texto: "Rechazada", clase: "insignia-injustificada" },
  cancelado: { texto: "Cancelada", clase: "insignia-inactivo" }
};

export const ETAPAS = { supervisor: "Supervisor", rrhh: "RRHH", gerencia: "Gerencia" };

// "Vacación" o "Permiso: Médico"
export function textoTipoSolicitud(solicitud) {
  return solicitud.tipo === "vacacion" ? "Vacación" : `Permiso${solicitud.tipo_permiso ? `: ${solicitud.tipo_permiso}` : ""}`;
}

// Rango de fechas: "lun 12/10/2026" o "lun 12/10/2026 al vie 16/10/2026"
export function rangoFechas(desde, hasta) {
  return desde === hasta ? fechaCorta(desde) : `${fechaCorta(desde)} al ${fechaCorta(hasta)}`;
}

// Minutos de retraso para mostrar: null = fuera de turno
export function textoRetraso(minutos) {
  if (minutos === null || minutos === undefined) return "Fuera de turno";
  return minutos > 0 ? `${minutos} min` : "—";
}
