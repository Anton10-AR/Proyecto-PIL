// --- Solicitudes (permisos y vacaciones) ---
import { peticion, consulta } from "./cliente";

export function crearSolicitud(datos) {
  return peticion("/solicitudes", { metodo: "POST", cuerpo: datos });
}

export function listarSolicitudes({ trabajador, estado } = {}) {
  return peticion(`/solicitudes${consulta({ trabajador, estado })}`);
}

export function cambiarEstadoSolicitud(id, estado, id_aprobador) {
  return peticion(`/solicitudes/${id}/estado`, { metodo: "PUT", cuerpo: { estado, id_aprobador } });
}
