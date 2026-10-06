// Rutas de la app. Cada entrada indica qué roles pueden verla; las que tienen
// enMenu: false son subpáginas (no aparecen en el menú lateral).
import ListaPersonal from "./components/personal/ListaPersonal";
import FichaTrabajador from "./components/personal/FichaTrabajador";
import FormularioTrabajador from "./components/personal/FormularioTrabajador";
import Asistencia from "./components/Asistencia";
import Solicitudes from "./components/Solicitudes";
import Reportes from "./components/Reportes";
import { ROLES } from "./roles";

export const MENU = [
  { ruta: "/personal", etiqueta: "Personal", roles: ROLES, componente: ListaPersonal },
  { ruta: "/personal/nuevo", roles: ["rrhh"], componente: FormularioTrabajador, enMenu: false },
  { ruta: "/personal/:id", roles: ROLES, componente: FichaTrabajador, enMenu: false },
  { ruta: "/personal/:id/editar", roles: ["rrhh"], componente: FormularioTrabajador, enMenu: false },
  { ruta: "/asistencia", etiqueta: "Asistencia", roles: ROLES, componente: Asistencia },
  { ruta: "/solicitudes", etiqueta: "Solicitudes", roles: ROLES, componente: Solicitudes },
  // Hasta la fase de reportes, el resumen es de toda la empresa: solo RRHH y Gerencia
  { ruta: "/reportes", etiqueta: "Reportes", roles: ["rrhh", "gerencia"], componente: Reportes }
];

export function menuDelRol(rol) {
  return MENU.filter((item) => item.enMenu !== false && item.roles.includes(rol));
}
