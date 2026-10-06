// --- Trabajadores (Personal) ---
import { peticion, consulta } from "./cliente";

export function listarTrabajadores(buscar = "") {
  return peticion(`/trabajadores${consulta({ buscar })}`);
}

export function crearTrabajador(datos) {
  return peticion("/trabajadores", { metodo: "POST", cuerpo: datos });
}

export function actualizarTrabajador(id, datos) {
  return peticion(`/trabajadores/${id}`, { metodo: "PUT", cuerpo: datos });
}

export function darDeBajaTrabajador(id) {
  return peticion(`/trabajadores/${id}`, { metodo: "DELETE" });
}
