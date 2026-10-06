// Ficha del trabajador: datos, equipo a cargo, cuenta de acceso (RRHH) e historial de actividad
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { useAuth } from "../../contexto/useAuth";
import {
  obtenerTrabajador, actualizarTrabajador, darDeBajaTrabajador,
  crearCuenta, actualizarCuenta, restablecerClave
} from "../../api/trabajadores";
import { NOMBRES_ROL, ROLES } from "../../roles";

function Dato({ etiqueta, valor }) {
  return (
    <div className="dato">
      <dt>{etiqueta}</dt>
      <dd>{valor || "—"}</dd>
    </div>
  );
}

function SeccionCuenta({ trabajador, esPropia, alActualizar, setMensaje, setAviso }) {
  const [rol, setRol] = useState(trabajador.rol || "trabajador");
  const [nuevoUsuario, setNuevoUsuario] = useState("");

  function ejecutar(promesa, textoExito) {
    setMensaje("");
    setAviso("");
    promesa
      .then(() => { setAviso(textoExito); alActualizar(); })
      .catch((err) => setMensaje(err.message));
  }

  if (!trabajador.usuario) {
    return (
      <section>
        <h3>Cuenta de acceso</h3>
        <p className="ayuda">Este trabajador no tiene cuenta. La contraseña inicial será su CI.</p>
        <form
          className="formulario"
          onSubmit={(e) => { e.preventDefault(); ejecutar(crearCuenta(trabajador.id, { usuario: nuevoUsuario, rol }), "Cuenta creada"); }}
        >
          <input placeholder="Usuario" value={nuevoUsuario} onChange={(e) => setNuevoUsuario(e.target.value)} required pattern="[a-z0-9._]{3,30}" />
          <select value={rol} onChange={(e) => setRol(e.target.value)}>
            {ROLES.map((r) => <option key={r} value={r}>{NOMBRES_ROL[r]}</option>)}
          </select>
          <button type="submit">Crear cuenta</button>
        </form>
      </section>
    );
  }

  return (
    <section>
      <h3>Cuenta de acceso</h3>
      <dl className="datos">
        <Dato etiqueta="Usuario" valor={trabajador.usuario} />
        <Dato etiqueta="Estado de la cuenta" valor={trabajador.cuenta_activa ? "Habilitada" : "Deshabilitada"} />
      </dl>
      {esPropia ? (
        <p className="ayuda">No puede modificar su propia cuenta desde aquí.</p>
      ) : (
        <div className="barra-acciones">
          <select value={rol} onChange={(e) => setRol(e.target.value)} aria-label="Rol">
            {ROLES.map((r) => <option key={r} value={r}>{NOMBRES_ROL[r]}</option>)}
          </select>
          <button disabled={rol === trabajador.rol} onClick={() => ejecutar(actualizarCuenta(trabajador.id, { rol }), "Rol actualizado")}>
            Cambiar rol
          </button>
          <button onClick={() => ejecutar(actualizarCuenta(trabajador.id, { activo: !trabajador.cuenta_activa }), trabajador.cuenta_activa ? "Cuenta deshabilitada" : "Cuenta habilitada")}>
            {trabajador.cuenta_activa ? "Deshabilitar cuenta" : "Habilitar cuenta"}
          </button>
          <button
            onClick={() => {
              if (confirm("¿Restablecer la contraseña al CI del trabajador?")) {
                ejecutar(restablecerClave(trabajador.id), "Contraseña restablecida al CI; deberá cambiarla al ingresar");
              }
            }}
          >
            Restablecer contraseña
          </button>
        </div>
      )}
    </section>
  );
}

export default function FichaTrabajador() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const [trabajador, setTrabajador] = useState(null);
  const [pestana, setPestana] = useState("asistencia");
  const [mensaje, setMensaje] = useState("");
  const [aviso, setAviso] = useState("");
  const esRRHH = usuario.rol === "rrhh";
  const esPropia = Number(id) === usuario.id_trabajador;

  const cargar = useCallback(() => {
    obtenerTrabajador(id).then(setTrabajador).catch((err) => setMensaje(err.message));
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  function cambiarEstado() {
    setMensaje("");
    setAviso("");
    const accion = trabajador.estado === "activo"
      ? (confirm("¿Dar de baja a este trabajador? Ya no podrá ingresar al sistema.") ? darDeBajaTrabajador(id) : null)
      : actualizarTrabajador(id, { estado: "activo" });
    if (accion) accion.then(cargar).catch((err) => setMensaje(err.message));
  }

  if (!trabajador) return mensaje ? <p className="error">{mensaje}</p> : <p className="cargando">Cargando...</p>;

  const { historial, equipo } = trabajador;

  return (
    <div>
      <div className="encabezado-pagina">
        <div>
          <h2>{trabajador.nombre} {trabajador.apellido}</h2>
          <p className="subtitulo">
            {trabajador.cargo || "Sin cargo"} · {trabajador.area || "Sin área"}{" "}
            <span className={`insignia insignia-${trabajador.estado}`}>{trabajador.estado}</span>
          </p>
        </div>
        <div className="barra-acciones">
          {usuario.rol !== "trabajador" && <Link to="/personal">Volver al listado</Link>}
          {esRRHH && <Link to={`/personal/${id}/editar`} className="boton-primario">Editar</Link>}
          {esRRHH && !esPropia && (
            <button onClick={cambiarEstado}>{trabajador.estado === "activo" ? "Dar de baja" : "Reactivar"}</button>
          )}
        </div>
      </div>
      {mensaje && <p className="error">{mensaje}</p>}
      {aviso && <p className="exito">{aviso}</p>}

      <section>
        <h3>Datos</h3>
        <dl className="datos">
          <Dato etiqueta="CI" valor={trabajador.ci} />
          <Dato etiqueta="Fecha de nacimiento" valor={trabajador.fecha_nacimiento} />
          <Dato etiqueta="Teléfono" valor={trabajador.telefono} />
          <Dato etiqueta="Correo" valor={trabajador.correo} />
          <Dato etiqueta="Dirección" valor={trabajador.direccion} />
          <Dato etiqueta="Fecha de ingreso" valor={trabajador.fecha_ingreso} />
          <Dato etiqueta="Tipo de contrato" valor={trabajador.tipo_contrato} />
          <Dato etiqueta="Supervisor" valor={trabajador.nombre_supervisor} />
          {trabajador.rol && <Dato etiqueta="Rol en el sistema" valor={NOMBRES_ROL[trabajador.rol]} />}
        </dl>
      </section>

      {equipo.length > 0 && (
        <section>
          <h3>Equipo a cargo ({equipo.length})</h3>
          <ul className="lista-simple">
            {equipo.map((m) => (
              <li key={m.id}>
                <Link to={`/personal/${m.id}`}>{m.apellido}, {m.nombre}</Link> — {m.cargo || "Sin cargo"}
                {m.estado !== "activo" && <span className="insignia insignia-inactivo">{m.estado}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {esRRHH && (
        <SeccionCuenta
          key={`${trabajador.id}-${trabajador.usuario}-${trabajador.rol}`}
          trabajador={trabajador}
          esPropia={esPropia}
          alActualizar={cargar}
          setMensaje={setMensaje}
          setAviso={setAviso}
        />
      )}

      <section>
        <h3>Historial de actividad</h3>
        <div className="pestanas" role="tablist">
          <button role="tab" aria-selected={pestana === "asistencia"} className={pestana === "asistencia" ? "activa" : ""} onClick={() => setPestana("asistencia")}>
            Asistencia ({historial.asistencia.length})
          </button>
          <button role="tab" aria-selected={pestana === "solicitudes"} className={pestana === "solicitudes" ? "activa" : ""} onClick={() => setPestana("solicitudes")}>
            Solicitudes ({historial.solicitudes.length})
          </button>
        </div>

        {pestana === "asistencia" && (
          <div className="tabla-contenedor">
            <p className="ayuda">Últimos 30 registros.</p>
            <table>
              <thead><tr><th>Fecha</th><th>Entrada</th><th>Salida</th><th>Retraso</th><th>Horas</th></tr></thead>
              <tbody>
                {historial.asistencia.map((r) => (
                  <tr key={r.id}>
                    <td>{r.fecha}</td><td>{r.hora_entrada || "—"}</td><td>{r.hora_salida || "—"}</td>
                    <td>{r.retraso ? "Sí" : "No"}</td><td>{r.horas_trabajadas ?? "—"}</td>
                  </tr>
                ))}
                {historial.asistencia.length === 0 && <tr><td colSpan={5} className="vacio">Sin registros de asistencia.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {pestana === "solicitudes" && (
          <div className="tabla-contenedor">
            <table>
              <thead><tr><th>Tipo</th><th>Desde</th><th>Hasta</th><th>Motivo</th><th>Estado</th><th>Solicitada</th></tr></thead>
              <tbody>
                {historial.solicitudes.map((s) => (
                  <tr key={s.id}>
                    <td>{s.tipo === "vacacion" ? "Vacación" : "Permiso"}</td><td>{s.fecha_inicio}</td><td>{s.fecha_fin}</td>
                    <td>{s.motivo || "—"}</td><td>{s.estado}</td><td>{s.fecha_solicitud}</td>
                  </tr>
                ))}
                {historial.solicitudes.length === 0 && <tr><td colSpan={6} className="vacio">Sin solicitudes.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
