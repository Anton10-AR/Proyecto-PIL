// Exige sesión iniciada (y opcionalmente uno de los roles indicados) para mostrar su contenido
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../contexto/useAuth";

export default function RutaProtegida({ roles, children }) {
  const { usuario, cargando } = useAuth();
  const ubicacion = useLocation();

  if (cargando) return <p className="cargando">Cargando...</p>;
  if (!usuario) return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />;
  if (usuario.debe_cambiar_clave && ubicacion.pathname !== "/cambiar-clave") {
    return <Navigate to="/cambiar-clave" replace />;
  }
  if (roles && !roles.includes(usuario.rol)) {
    return <p className="error">No tiene permiso para ver esta sección.</p>;
  }
  return children;
}
