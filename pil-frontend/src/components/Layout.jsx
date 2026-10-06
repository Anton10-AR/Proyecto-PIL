// Estructura de la app con sesión: cabecera, menú lateral según el rol y contenido
import { NavLink, Outlet, useNavigate } from "react-router";
import { useAuth } from "../contexto/useAuth";
import { menuDelRol } from "../navegacion";
import { NOMBRES_ROL } from "../roles";
import Campana from "./Campana";

export default function Layout() {
  const { usuario, cerrarSesion } = useAuth();
  const navegar = useNavigate();
  // Mientras deba cambiar la contraseña inicial, solo se muestra ese formulario
  const restringido = usuario.debe_cambiar_clave;

  function salir() {
    cerrarSesion().then(() => navegar("/login", { replace: true }));
  }

  return (
    <div className="layout">
      <header className="barra-superior">
        <h1>RR.HH. — PIL Andina</h1>
        <div className="barra-usuario">
          {!restringido && <Campana />}
          <div className="usuario-datos">
            <span>{usuario.nombre} {usuario.apellido}</span>
            <small>{NOMBRES_ROL[usuario.rol]}</small>
          </div>
          <button onClick={salir}>Cerrar sesión</button>
        </div>
      </header>

      {!restringido && (
        <nav className="menu-lateral">
          <NavLink to="/" end>Inicio</NavLink>
          {menuDelRol(usuario.rol).map((item) => (
            <NavLink key={item.ruta} to={item.ruta}>{item.etiqueta}</NavLink>
          ))}
          <NavLink to="/cambiar-clave">Cambiar contraseña</NavLink>
        </nav>
      )}

      <main className={restringido ? "contenido contenido-completo" : "contenido"}>
        <Outlet />
      </main>
    </div>
  );
}
