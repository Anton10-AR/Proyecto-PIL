// Servidor principal de la API REST del prototipo de RRHH - PIL Andina
const express = require("express");
const cors = require("cors");

require("./db/database"); // crea las tablas si no existen

const { autenticar, permitirRoles } = require("./middleware/auth");
const authRouter = require("./routes/auth");
const notificacionesRouter = require("./routes/notificaciones");
const trabajadoresRouter = require("./routes/trabajadores");
const asistenciaRouter = require("./routes/asistencia");
const ausenciasRouter = require("./routes/ausencias");
const turnosRouter = require("./routes/turnos");
const feriadosRouter = require("./routes/feriados");
const configuracionRouter = require("./routes/configuracion");
const tiposPermisoRouter = require("./routes/tiposPermiso");
const { router: archivosRouter } = require("./routes/archivos");
const capacitacionesRouter = require("./routes/capacitaciones");
const evaluacionesRouter = require("./routes/evaluaciones");
const encuestasRouter = require("./routes/encuestas");
const sugerenciasRouter = require("./routes/sugerencias");
const comunicadosRouter = require("./routes/comunicados");
const solicitudesRouter = require("./routes/solicitudes");
const reportesRouter = require("./routes/reportes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ mensaje: "API del prototipo de RRHH - PIL Andina funcionando" });
});

// Rutas públicas (login) y de sesión: cada una aplica autenticar() donde corresponde
app.use("/api/auth", authRouter);

// A partir de aquí todas las rutas exigen una sesión válida
app.use("/api", autenticar);

app.use("/api/notificaciones", notificacionesRouter);
app.use("/api/trabajadores", trabajadoresRouter);
app.use("/api/asistencia", asistenciaRouter);
app.use("/api/ausencias", ausenciasRouter);
app.use("/api/turnos", turnosRouter);
app.use("/api/feriados", feriadosRouter);
app.use("/api/configuracion", configuracionRouter);
app.use("/api/tipos-permiso", tiposPermisoRouter);
app.use("/api/archivos", archivosRouter);
app.use("/api/capacitaciones", capacitacionesRouter);
app.use("/api/evaluaciones", evaluacionesRouter);
app.use("/api/encuestas", encuestasRouter);
app.use("/api/sugerencias", sugerenciasRouter);
app.use("/api/comunicados", comunicadosRouter);

// Errores no controlados: se registran en consola y se responde JSON (el frontend siempre espera JSON)
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: "Error interno del servidor" });
});
app.use("/api/solicitudes", solicitudesRouter);
// Hasta la fase de reportes, el resumen es de toda la empresa: solo RRHH y Gerencia
app.use("/api/reportes", permitirRoles("rrhh", "gerencia"), reportesRouter);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
