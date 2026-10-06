// Menú lateral y rutas de la app. Cada entrada indica qué roles pueden verla.
import Personal from "./components/Personal";
import Asistencia from "./components/Asistencia";
import Solicitudes from "./components/Solicitudes";
import Reportes from "./components/Reportes";

export const NOMBRES_ROL = {
  trabajador: "Trabajador",
  supervisor: "Supervisor",
  rrhh: "Recursos Humanos",
  gerencia: "Gerencia"
};

const TODOS = Object.keys(NOMBRES_ROL);

export const MENU = [
  { ruta: "/personal", etiqueta: "Personal", roles: TODOS, componente: Personal },
  { ruta: "/asistencia", etiqueta: "Asistencia", roles: TODOS, componente: Asistencia },
  { ruta: "/solicitudes", etiqueta: "Solicitudes", roles: TODOS, componente: Solicitudes },
  // Hasta la fase de reportes, el resumen es de toda la empresa: solo RRHH y Gerencia
  { ruta: "/reportes", etiqueta: "Reportes", roles: ["rrhh", "gerencia"], componente: Reportes }
];

export function menuDelRol(rol) {
  return MENU.filter((item) => item.roles.includes(rol));
}
