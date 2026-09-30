import { useState } from "react";
import Personal from "./components/Personal";
import Asistencia from "./components/Asistencia";
import Solicitudes from "./components/Solicitudes";
import Reportes from "./components/Reportes";
import "./App.css";

const PESTAÑAS = [
  { id: "personal", etiqueta: "Personal", componente: Personal },
  { id: "asistencia", etiqueta: "Asistencia", componente: Asistencia },
  { id: "solicitudes", etiqueta: "Solicitudes", componente: Solicitudes },
  { id: "reportes", etiqueta: "Reportes", componente: Reportes }
];

export default function App() {
  const [pestañaActiva, setPestañaActiva] = useState("personal");
  const Activa = PESTAÑAS.find((p) => p.id === pestañaActiva).componente;

  return (
    <div className="app">
      <header>
        <h1>Sistema de Gestión de RR.HH. — PIL Andina</h1>
        <p className="subtitulo">Prototipo del subgrupo — Personal · Asistencia · Solicitudes</p>
      </header>

      <nav>
        {PESTAÑAS.map((p) => (
          <button
            key={p.id}
            className={p.id === pestañaActiva ? "activa" : ""}
            onClick={() => setPestañaActiva(p.id)}
          >
            {p.etiqueta}
          </button>
        ))}
      </nav>

      <main>
        <Activa />
      </main>
    </div>
  );
}
