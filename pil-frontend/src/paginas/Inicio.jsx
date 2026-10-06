import { Link } from "react-router";
import { useAuth } from "../contexto/useAuth";
import { menuDelRol, NOMBRES_ROL } from "../navegacion";

export default function Inicio() {
  const { usuario } = useAuth();

  return (
    <div>
      <h2>Bienvenido, {usuario.nombre}</h2>
      <p className="subtitulo">
        {usuario.cargo || "Sin cargo"} · {usuario.area || "Sin área"} · Rol: {NOMBRES_ROL[usuario.rol]}
      </p>

      <h3>Accesos</h3>
      <div className="tarjetas">
        {menuDelRol(usuario.rol).map((item) => (
          <Link key={item.ruta} to={item.ruta} className="tarjeta tarjeta-enlace">
            <span className="tarjeta-titulo">{item.etiqueta}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
