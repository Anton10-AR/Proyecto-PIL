import { useEffect, useState } from "react";
import { listarTrabajadores, crearTrabajador, actualizarTrabajador, darDeBajaTrabajador } from "../api/trabajadores";

const VACIO = {
  nombre: "", apellido: "", ci: "", cargo: "", area: "",
  fecha_ingreso: "", tipo_contrato: "", telefono: "", correo: ""
};

export default function Personal() {
  const [trabajadores, setTrabajadores] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [formulario, setFormulario] = useState(VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [mensaje, setMensaje] = useState("");

  function cargar(textoBusqueda = "") {
    listarTrabajadores(textoBusqueda)
      .then(setTrabajadores)
      .catch((err) => setMensaje(err.message));
  }

  useEffect(() => { cargar(); }, []);

  function manejarCambio(e) {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  }

  function manejarEnviar(e) {
    e.preventDefault();
    setMensaje("");

    const accion = editandoId
      ? actualizarTrabajador(editandoId, formulario)
      : crearTrabajador(formulario);

    accion
      .then(() => {
        setFormulario(VACIO);
        setEditandoId(null);
        cargar(busqueda);
      })
      .catch((err) => setMensaje(err.message));
  }

  function editar(trabajador) {
    setEditandoId(trabajador.id);
    setFormulario({
      nombre: trabajador.nombre || "",
      apellido: trabajador.apellido || "",
      ci: trabajador.ci || "",
      cargo: trabajador.cargo || "",
      area: trabajador.area || "",
      fecha_ingreso: trabajador.fecha_ingreso || "",
      tipo_contrato: trabajador.tipo_contrato || "",
      telefono: trabajador.telefono || "",
      correo: trabajador.correo || ""
    });
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setFormulario(VACIO);
  }

  function baja(id) {
    if (!confirm("¿Dar de baja a este trabajador?")) return;
    darDeBajaTrabajador(id).then(() => cargar(busqueda)).catch((err) => setMensaje(err.message));
  }

  return (
    <div>
      <h2>Personal</h2>
      {mensaje && <p className="error">{mensaje}</p>}

      <form onSubmit={manejarEnviar} className="formulario">
        <input name="nombre" placeholder="Nombre" value={formulario.nombre} onChange={manejarCambio} required />
        <input name="apellido" placeholder="Apellido" value={formulario.apellido} onChange={manejarCambio} required />
        <input name="ci" placeholder="CI" value={formulario.ci} onChange={manejarCambio} required disabled={!!editandoId} />
        <input name="cargo" placeholder="Cargo" value={formulario.cargo} onChange={manejarCambio} />
        <input name="area" placeholder="Área" value={formulario.area} onChange={manejarCambio} />
        <input name="fecha_ingreso" type="date" value={formulario.fecha_ingreso} onChange={manejarCambio} />
        <input name="tipo_contrato" placeholder="Tipo de contrato" value={formulario.tipo_contrato} onChange={manejarCambio} />
        <input name="telefono" placeholder="Teléfono" value={formulario.telefono} onChange={manejarCambio} />
        <input name="correo" placeholder="Correo" value={formulario.correo} onChange={manejarCambio} />
        <div className="acciones-formulario">
          <button type="submit">{editandoId ? "Guardar cambios" : "Registrar trabajador"}</button>
          {editandoId && <button type="button" onClick={cancelarEdicion}>Cancelar</button>}
        </div>
      </form>

      <div className="busqueda">
        <input
          placeholder="Buscar por nombre, área o cargo..."
          value={busqueda}
          onChange={(e) => { setBusqueda(e.target.value); cargar(e.target.value); }}
        />
      </div>

      <table>
        <thead>
          <tr>
            <th>Nombre</th><th>CI</th><th>Cargo</th><th>Área</th><th>Estado</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {trabajadores.map((t) => (
            <tr key={t.id}>
              <td>{t.nombre} {t.apellido}</td>
              <td>{t.ci}</td>
              <td>{t.cargo}</td>
              <td>{t.area}</td>
              <td>{t.estado}</td>
              <td>
                <button onClick={() => editar(t)}>Editar</button>
                {t.estado === "activo" && <button onClick={() => baja(t.id)}>Dar de baja</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
