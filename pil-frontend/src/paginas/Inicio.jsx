import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../contexto/useAuth";
import { menuDelRol } from "../navegacion";
import { NOMBRES_ROL } from "../roles";
import { listarComunicados, listarEncuestas } from "../api/comunicacion";

export default function Inicio() {
  const { usuario } = useAuth();
  const [comunicados, setComunicados] = useState([]);
  const [encuestas, setEncuestas] = useState([]);

  useEffect(() => {
    listarComunicados({ limite: 3 }).then(setComunicados).catch(() => {});
    listarEncuestas().then((lista) => setEncuestas(lista.filter((e) => e.estado_actual === "abierta" && !e.respondida))).catch(() => {});
  }, []);

  return (
    <div>
      <h2>Bienvenido, {usuario.nombre}</h2>
      <p className="subtitulo">
        {usuario.cargo || "Sin cargo"} · {usuario.area || "Sin área"} · Rol: {NOMBRES_ROL[usuario.rol]}
      </p>

      {encuestas.length > 0 && (
        <p className="aviso">
          Tiene {encuestas.length} encuesta(s) de clima por responder: {encuestas.map((e, i) => (
            <span key={e.id}>{i > 0 && ", "}<Link to={`/encuestas/${e.id}`}>{e.titulo}</Link></span>
          ))}. Son anónimas.
        </p>
      )}

      <section>
        <div className="encabezado-pagina">
          <h3>Últimos comunicados</h3>
          <Link to="/comunicados">Ver todos</Link>
        </div>
        <div className="lista-comunicados">
          {comunicados.map((c) => (
            <article key={c.id} className={`comunicado comunicado-resumen${c.importante ? " comunicado-importante" : ""}`}>
              <strong>{c.importante ? "📌 " : ""}{c.titulo}</strong>
              <span className="ayuda"> · {c.fecha_publicacion.slice(0, 10)}</span>
              <p>{c.contenido.length > 160 ? `${c.contenido.slice(0, 160)}...` : c.contenido}</p>
            </article>
          ))}
          {comunicados.length === 0 && <p className="ayuda">No hay comunicados.</p>}
        </div>
      </section>

      <section>
        <h3>Accesos</h3>
        <div className="tarjetas">
          {menuDelRol(usuario.rol).map((item) => (
            <Link key={item.ruta} to={item.ruta} className="tarjeta tarjeta-enlace">
              <span className="tarjeta-titulo">{item.etiqueta}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
