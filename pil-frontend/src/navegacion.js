// Rutas de la app. Cada entrada indica qué roles pueden verla; las que tienen
// enMenu: false son subpáginas (no aparecen en el menú lateral).
import ListaPersonal from "./components/personal/ListaPersonal";
import FichaTrabajador from "./components/personal/FichaTrabajador";
import FormularioTrabajador from "./components/personal/FormularioTrabajador";
import MiAsistencia from "./components/asistencia/MiAsistencia";
import AsistenciaPersonal from "./components/asistencia/AsistenciaPersonal";
import Ausencias from "./components/asistencia/Ausencias";
import Turnos from "./components/turnos/Turnos";
import Configuracion from "./components/configuracion/Configuracion";
import Solicitudes from "./components/Solicitudes";
import Reportes from "./components/Reportes";
import { ROLES } from "./roles";

// Roles que consultan información de otros trabajadores (su equipo o toda la empresa)
const CON_EQUIPO = ["supervisor", "rrhh", "gerencia"];

export const MENU = [
  { ruta: "/personal", etiqueta: "Personal", roles: ROLES, componente: ListaPersonal },
  { ruta: "/personal/nuevo", roles: ["rrhh"], componente: FormularioTrabajador, enMenu: false },
  { ruta: "/personal/:id", roles: ROLES, componente: FichaTrabajador, enMenu: false },
  { ruta: "/personal/:id/editar", roles: ["rrhh"], componente: FormularioTrabajador, enMenu: false },
  { ruta: "/asistencia", etiqueta: "Mi asistencia", roles: ROLES, componente: MiAsistencia },
  { ruta: "/asistencia/personal", etiqueta: "Asistencia del personal", roles: CON_EQUIPO, componente: AsistenciaPersonal },
  { ruta: "/asistencia/ausencias", etiqueta: "Ausencias", roles: CON_EQUIPO, componente: Ausencias },
  { ruta: "/turnos", etiqueta: "Turnos", roles: CON_EQUIPO, componente: Turnos },
  { ruta: "/solicitudes", etiqueta: "Solicitudes", roles: ROLES, componente: Solicitudes },
  // Hasta la fase de reportes, el resumen es de toda la empresa: solo RRHH y Gerencia
  { ruta: "/reportes", etiqueta: "Reportes", roles: ["rrhh", "gerencia"], componente: Reportes },
  { ruta: "/configuracion", etiqueta: "Configuración", roles: ["rrhh", "gerencia"], componente: Configuracion }
];

export function menuDelRol(rol) {
  return MENU.filter((item) => item.enMenu !== false && item.roles.includes(rol));
}
