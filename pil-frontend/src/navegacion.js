// Rutas de la app. Cada entrada indica qué roles pueden verla y en qué grupo del menú aparece;
// las que tienen enMenu: false son subpáginas (no aparecen en el menú lateral).
import ListaPersonal from "./components/personal/ListaPersonal";
import FichaTrabajador from "./components/personal/FichaTrabajador";
import FormularioTrabajador from "./components/personal/FormularioTrabajador";
import MiAsistencia from "./components/asistencia/MiAsistencia";
import AsistenciaPersonal from "./components/asistencia/AsistenciaPersonal";
import Ausencias from "./components/asistencia/Ausencias";
import Turnos from "./components/turnos/Turnos";
import Configuracion from "./components/configuracion/Configuracion";
import MisSolicitudes from "./components/solicitudes/MisSolicitudes";
import BandejaSolicitudes from "./components/solicitudes/BandejaSolicitudes";
import Calendario from "./components/solicitudes/Calendario";
import ListaCapacitaciones from "./components/capacitaciones/ListaCapacitaciones";
import DetalleCapacitacion from "./components/capacitaciones/DetalleCapacitacion";
import FormularioCapacitacion from "./components/capacitaciones/FormularioCapacitacion";
import MisEvaluaciones from "./components/evaluaciones/MisEvaluaciones";
import EvaluacionesAsignadas from "./components/evaluaciones/EvaluacionesAsignadas";
import DetalleEvaluacion from "./components/evaluaciones/DetalleEvaluacion";
import GestionEvaluaciones from "./components/evaluaciones/GestionEvaluaciones";
import DetallePeriodo from "./components/evaluaciones/DetallePeriodo";
import Reportes from "./components/Reportes";
import { ROLES } from "./roles";

// Roles que consultan información de otros trabajadores (su equipo o toda la empresa)
const CON_EQUIPO = ["supervisor", "rrhh", "gerencia"];

export const MENU = [
  { ruta: "/personal", grupo: "General", etiqueta: "Personal", roles: ROLES, componente: ListaPersonal },
  { ruta: "/personal/nuevo", roles: ["rrhh"], componente: FormularioTrabajador, enMenu: false },
  { ruta: "/personal/:id", roles: ROLES, componente: FichaTrabajador, enMenu: false },
  { ruta: "/personal/:id/editar", roles: ["rrhh"], componente: FormularioTrabajador, enMenu: false },
  { ruta: "/asistencia", grupo: "Asistencia", etiqueta: "Mi asistencia", roles: ROLES, componente: MiAsistencia },
  { ruta: "/asistencia/personal", grupo: "Asistencia", etiqueta: "Asistencia del personal", roles: CON_EQUIPO, componente: AsistenciaPersonal },
  { ruta: "/asistencia/ausencias", grupo: "Asistencia", etiqueta: "Ausencias", roles: CON_EQUIPO, componente: Ausencias },
  { ruta: "/turnos", grupo: "Asistencia", etiqueta: "Turnos", roles: CON_EQUIPO, componente: Turnos },
  { ruta: "/solicitudes", grupo: "Permisos y vacaciones", etiqueta: "Mis solicitudes", roles: ROLES, componente: MisSolicitudes },
  { ruta: "/solicitudes/bandeja", grupo: "Permisos y vacaciones", etiqueta: "Aprobación de solicitudes", roles: CON_EQUIPO, componente: BandejaSolicitudes },
  { ruta: "/calendario", grupo: "Permisos y vacaciones", etiqueta: "Calendario", roles: ROLES, componente: Calendario },
  { ruta: "/capacitaciones", grupo: "Desarrollo", etiqueta: "Capacitación", roles: ROLES, componente: ListaCapacitaciones },
  { ruta: "/capacitaciones/nueva", roles: ["rrhh"], componente: FormularioCapacitacion, enMenu: false },
  { ruta: "/capacitaciones/:id", roles: ROLES, componente: DetalleCapacitacion, enMenu: false },
  { ruta: "/capacitaciones/:id/editar", roles: ["rrhh"], componente: FormularioCapacitacion, enMenu: false },
  { ruta: "/evaluaciones", grupo: "Desarrollo", etiqueta: "Mis evaluaciones", roles: ROLES, componente: MisEvaluaciones },
  { ruta: "/evaluaciones/asignadas", grupo: "Desarrollo", etiqueta: "Evaluar desempeño", roles: CON_EQUIPO, componente: EvaluacionesAsignadas },
  { ruta: "/evaluaciones/gestion", grupo: "Desarrollo", etiqueta: "Gestión de evaluaciones", roles: ["rrhh", "gerencia"], componente: GestionEvaluaciones },
  { ruta: "/evaluaciones/periodos/:id", roles: ["rrhh", "gerencia"], componente: DetallePeriodo, enMenu: false },
  { ruta: "/evaluaciones/:id", roles: ROLES, componente: DetalleEvaluacion, enMenu: false },
  // Hasta la fase de reportes, el resumen es de toda la empresa: solo RRHH y Gerencia
  { ruta: "/reportes", grupo: "Administración", etiqueta: "Reportes", roles: ["rrhh", "gerencia"], componente: Reportes },
  { ruta: "/configuracion", grupo: "Administración", etiqueta: "Configuración", roles: ["rrhh", "gerencia"], componente: Configuracion }
];

export function menuDelRol(rol) {
  return MENU.filter((item) => item.enMenu !== false && item.roles.includes(rol));
}

// Entradas del menú del rol agrupadas, en el orden en que aparecen: [{ grupo, items }]
export function menuAgrupado(rol) {
  const grupos = [];
  menuDelRol(rol).forEach((item) => {
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.grupo === item.grupo) ultimo.items.push(item);
    else grupos.push({ grupo: item.grupo, items: [item] });
  });
  return grupos;
}
