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

// Minutos de retraso para mostrar: null = fuera de turno
export function textoRetraso(minutos) {
  if (minutos === null || minutos === undefined) return "Fuera de turno";
  return minutos > 0 ? `${minutos} min` : "—";
}
