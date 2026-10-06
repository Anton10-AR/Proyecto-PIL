// Listado de personal con búsqueda y filtros. Cada rol ve solo a quienes le corresponde
// (lo filtra el backend); el trabajador va directo a su propia ficha.
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router";
import { useAuth } from "../../contexto/useAuth";
import { listarTrabajadores, obtenerOpcionesPersonal } from "../../api/trabajadores";
import { NOMBRES_ROL } from "../../roles";

export default function ListaPersonal() {
  const { usuario } = useAuth();
  const [trabajadores, setTrabajadores] = useState([]);
  const [opciones, setOpciones] = useState({ areas: [], cargos: [] });
  const [filtros, setFiltros] = useState({ buscar: "", area: "", cargo: "", estado: "activo" });
  const [mensaje, setMensaje] = useState("");
  const esRRHH = usuario.rol === "rrhh";

  useEffect(() => {
    if (usuario.rol === "trabajador") return;
    obtenerOpcionesPersonal().then(setOpciones).catch((err) => setMensaje(err.message));
  }, [usuario.rol]);

  useEffect(() => {
    if (usuario.rol === "trabajador") return;
    listarTrabajadores(filtros).then(setTrabajadores).catch((err) => setMensaje(err.message));
  }, [filtros, usuario.rol]);

  if (usuario.rol === "trabajador") {
    return <Navigate to={`/personal/${usuario.id_trabajador}`} replace />;
  }

  function cambiarFiltro(e) {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  }

  return (
    <div>
      <div className="encabezado-pagina">
        <h2>{usuario.rol === "supervisor" ? "Mi equipo" : "Personal"}</h2>
        {esRRHH && <Link to="/personal/nuevo" className="boton-primario">Registrar trabajador</Link>}
      </div>
      {mensaje && <p className="error">{mensaje}</p>}

      <div className="busqueda filtros">
        <input name="buscar" placeholder="Buscar por nombre, CI, área o cargo..." value={filtros.buscar} onChange={cambiarFiltro} />
        <select name="area" value={filtros.area} onChange={cambiarFiltro} aria-label="Área">
          <option value="">Todas las áreas</option>
          {opciones.areas.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <select name="cargo" value={filtros.cargo} onChange={cambiarFiltro} aria-label="Cargo">
          <option value="">Todos los cargos</option>
          {opciones.cargos.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select name="estado" value={filtros.estado} onChange={cambiarFiltro} aria-label="Estado laboral">
          <option value="">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
      </div>

      <div className="tabla-contenedor">
        <table>
          <thead>
            <tr>
              <th>Nombre</th><th>CI</th><th>Cargo</th><th>Área</th><th>Supervisor</th><th>Estado</th>
              {esRRHH && <th>Cuenta</th>}
            </tr>
          </thead>
          <tbody>
            {trabajadores.map((t) => (
              <tr key={t.id}>
                <td><Link to={`/personal/${t.id}`}>{t.apellido}, {t.nombre}</Link></td>
                <td>{t.ci}</td>
                <td>{t.cargo || "—"}</td>
                <td>{t.area || "—"}</td>
                <td>{t.nombre_supervisor || "—"}</td>
                <td><span className={`insignia insignia-${t.estado}`}>{t.estado}</span></td>
                {esRRHH && (
                  <td>{t.usuario ? `${t.usuario} · ${NOMBRES_ROL[t.rol]}${t.cuenta_activa ? "" : " (deshabilitada)"}` : "Sin cuenta"}</td>
                )}
              </tr>
            ))}
            {trabajadores.length === 0 && (
              <tr><td colSpan={esRRHH ? 7 : 6} className="vacio">No hay trabajadores que coincidan con los filtros.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
