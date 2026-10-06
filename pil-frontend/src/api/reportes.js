// --- Reportes (vista integrada, no tabla propia) ---
import { peticion, consulta } from "./cliente";

export function obtenerResumenReportes(mes) {
  return peticion(`/reportes/resumen${consulta({ mes })}`);
}
