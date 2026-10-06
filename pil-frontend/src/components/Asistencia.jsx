import { useEffect, useState } from "react";
import { listarTrabajadores } from "../api/trabajadores";
import { registrarEntrada, registrarSalida, consultarAsistencia } from "../api/asistencia";

export default function Asistencia() {
  const [trabajadores, setTrabajadores] = useState([]);
  const [idTrabajador, setIdTrabajador] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [horaEntrada, setHoraEntrada] = useState("");
  const [registroSalidaId, setRegistroSalidaId] = useState("");
  const [horaSalida, setHoraSalida] = useState("");
  const [registros, setRegistros] = useState([]);
  const [filtroTrabajador, setFiltroTrabajador] = useState("");
  const [filtroMes, setFiltroMes] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    listarTrabajadores().then(setTrabajadores).catch((err) => setMensaje(err.message));
  }, []);

  function buscarRegistros() {
    consultarAsistencia({ trabajador: filtroTrabajador || undefined, mes: filtroMes || undefined })
      .then(setRegistros)
      .catch((err) => setMensaje(err.message));
  }

  useEffect(() => { buscarRegistros(); }, []);

  function marcarEntrada(e) {
    e.preventDefault();
    setMensaje("");
    registrarEntrada({ id_trabajador: idTrabajador, fecha, hora_entrada: horaEntrada })
      .then(() => { setHoraEntrada(""); buscarRegistros(); })
      .catch((err) => setMensaje(err.message));
  }

  function marcarSalida(e) {
    e.preventDefault();
    setMensaje("");
    registrarSalida(registroSalidaId, horaSalida)
      .then(() => { setHoraSalida(""); setRegistroSalidaId(""); buscarRegistros(); })
      .catch((err) => setMensaje(err.message));
  }

  return (
    <div>
      <h2>Asistencia</h2>
      {mensaje && <p className="error">{mensaje}</p>}

      <div className="columnas">
        <form onSubmit={marcarEntrada} className="formulario">
          <h3>Registrar entrada</h3>
          <select value={idTrabajador} onChange={(e) => setIdTrabajador(e.target.value)} required>
            <option value="">-- Trabajador --</option>
            {trabajadores.map((t) => (
              <option key={t.id} value={t.id}>{t.nombre} {t.apellido}</option>
            ))}
          </select>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
          <input type="time" value={horaEntrada} onChange={(e) => setHoraEntrada(e.target.value)} required />
          <button type="submit">Registrar entrada</button>
        </form>

        <form onSubmit={marcarSalida} className="formulario">
          <h3>Registrar salida</h3>
          <input
            type="number"
            placeholder="ID de registro de asistencia"
            value={registroSalidaId}
            onChange={(e) => setRegistroSalidaId(e.target.value)}
            required
          />
          <input type="time" value={horaSalida} onChange={(e) => setHoraSalida(e.target.value)} required />
          <button type="submit">Registrar salida</button>
        </form>
      </div>

      <h3>Consultar asistencia</h3>
      <div className="busqueda">
        <select value={filtroTrabajador} onChange={(e) => { setFiltroTrabajador(e.target.value); }}>
          <option value="">-- Todos los trabajadores --</option>
          {trabajadores.map((t) => (
            <option key={t.id} value={t.id}>{t.nombre} {t.apellido}</option>
          ))}
        </select>
        <input type="month" value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)} />
        <button onClick={buscarRegistros}>Buscar</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th><th>Trabajador</th><th>Fecha</th><th>Entrada</th><th>Salida</th><th>Retraso</th><th>Horas</th>
          </tr>
        </thead>
        <tbody>
          {registros.map((r) => {
            const trabajador = trabajadores.find((t) => t.id === r.id_trabajador);
            return (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{trabajador ? `${trabajador.nombre} ${trabajador.apellido}` : r.id_trabajador}</td>
                <td>{r.fecha}</td>
                <td>{r.hora_entrada}</td>
                <td>{r.hora_salida || "—"}</td>
                <td>{r.retraso ? "Sí" : "No"}</td>
                <td>{r.horas_trabajadas ?? "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
