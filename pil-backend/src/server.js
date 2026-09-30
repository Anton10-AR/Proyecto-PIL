// Servidor principal de la API REST del prototipo de RRHH - PIL Andina
const express = require("express");
const cors = require("cors");

require("./db/database"); // crea las tablas si no existen

const trabajadoresRouter = require("./routes/trabajadores");
const asistenciaRouter = require("./routes/asistencia");
const solicitudesRouter = require("./routes/solicitudes");
const reportesRouter = require("./routes/reportes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/trabajadores", trabajadoresRouter);
app.use("/api/asistencia", asistenciaRouter);
app.use("/api/solicitudes", solicitudesRouter);
app.use("/api/reportes", reportesRouter);

app.get("/", (req, res) => {
  res.json({ mensaje: "API del prototipo de RRHH - PIL Andina funcionando" });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
