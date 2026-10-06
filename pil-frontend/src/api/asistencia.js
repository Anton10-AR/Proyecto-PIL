// --- Asistencia ---
import { peticion, consulta } from "./cliente";

export function registrarEntrada(datos) {
  return peticion("/asistencia", { metodo: "POST", cuerpo: datos });
}

export function registrarSalida(id, hora_salida) {
  return peticion(`/asistencia/${id}/salida`, { metodo: "PUT", cuerpo: { hora_salida } });
}

export function consultarAsistencia({ trabajador, fecha, mes } = {}) {
  return peticion(`/asistencia${consulta({ trabajador, fecha, mes })}`);
}
