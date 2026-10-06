import { useEffect, useState } from "react";
import { listarTrabajadores } from "../api/trabajadores";
import { crearSolicitud, listarSolicitudes, cambiarEstadoSolicitud } from "../api/solicitudes";

export default function Solicitudes() {
  const [trabajadores, setTrabajadores] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [formulario, setFormulario] = useState({
    id_trabajador: "", tipo: "permiso", fecha_inicio: "", fecha_fin: "", motivo: ""
  });

  function cargarSolicitudes(estado = filtroEstado) {
    listarSolicitudes({ estado: estado || undefined })
      .then(setSolicitudes)
      .catch((err) => setMensaje(err.message));
  }

  useEffect(() => {
    listarTrabajadores().then(setTrabajadores).catch((err) => setMensaje(err.message));
    cargarSolicitudes();
  }, []);

  function manejarCambio(e) {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  }

  function enviarSolicitud(e) {
    e.preventDefault();
    setMensaje("");
    crearSolicitud(formulario)
      .then(() => {
        setFormulario({ id_trabajador: "", tipo: "permiso", fecha_inicio: "", fecha_fin: "", motivo: "" });
        cargarSolicitudes();
      })
      .catch((err) => setMensaje(err.message));
  }

  function resolver(id, estado) {
    // En este prototipo se usa el mismo trabajador como aprobador si se seleccionó uno;
    // en una versión con login real, el aprobador vendría de la sesión activa.
    cambiarEstadoSolicitud(id, estado, formulario.id_trabajador || null)
      .then(() => cargarSolicitudes())
      .catch((err) => setMensaje(err.message));
  }

  return (
    <div>
      <h2>Solicitudes (Permisos y Vacaciones)</h2>
      {mensaje && <p className="error">{mensaje}</p>}

      <form onSubmit={enviarSolicitud} className="formulario">
        <h3>Nueva solicitud</h3>
        <select name="id_trabajador" value={formulario.id_trabajador} onChange={manejarCambio} required>
          <option value="">-- Trabajador --</option>
          {trabajadores.map((t) => (
            <option key={t.id} value={t.id}>{t.nombre} {t.apellido}</option>
          ))}
        </select>
        <select name="tipo" value={formulario.tipo} onChange={manejarCambio}>
          <option value="permiso">Permiso</option>
          <option value="vacacion">Vacación</option>
        </select>
        <input type="date" name="fecha_inicio" value={formulario.fecha_inicio} onChange={manejarCambio} required />
        <input type="date" name="fecha_fin" value={formulario.fecha_fin} onChange={manejarCambio} required />
        <input name="motivo" placeholder="Motivo" value={formulario.motivo} onChange={manejarCambio} />
        <button type="submit">Enviar solicitud</button>
      </form>

      <h3>Bandeja de solicitudes</h3>
      <div className="busqueda">
        <select value={filtroEstado} onChange={(e) => { setFiltroEstado(e.target.value); cargarSolicitudes(e.target.value); }}>
          <option value="">-- Todos los estados --</option>
          <option value="pendiente">Pendiente</option>
          <option value="aprobado">Aprobado</option>
          <option value="rechazado">Rechazado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th><th>Trabajador</th><th>Tipo</th><th>Desde</th><th>Hasta</th><th>Motivo</th><th>Estado</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {solicitudes.map((s) => {
            const trabajador = trabajadores.find((t) => t.id === s.id_trabajador);
            return (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{trabajador ? `${trabajador.nombre} ${trabajador.apellido}` : s.id_trabajador}</td>
                <td>{s.tipo}</td>
                <td>{s.fecha_inicio}</td>
                <td>{s.fecha_fin}</td>
                <td>{s.motivo}</td>
                <td>{s.estado}</td>
                <td>
                  {s.estado === "pendiente" && (
                    <>
                      <button onClick={() => resolver(s.id, "aprobado")}>Aprobar</button>
                      <button onClick={() => resolver(s.id, "rechazado")}>Rechazar</button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
