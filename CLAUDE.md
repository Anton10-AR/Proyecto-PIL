# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repositorio

Este es un prototipo académico (proyecto PIL) de un sistema de RR.HH. para PIL Andina, compuesto por dos paquetes npm independientes sin workspace compartido: `pil-backend` (API) y `pil-frontend` (SPA). No es un repositorio git (`git init` sería necesario antes de usar comandos de control de versiones).

## Comandos

### Backend (`pil-backend/`)
```bash
npm install
node src/server.js     # arranca la API en http://localhost:3000
npm run seed            # borra y recarga datos de ejemplo (8 trabajadores, asistencia, solicitudes)
```
- Requiere Node.js v22.5+ (usa el módulo nativo `node:sqlite`, sin dependencias de compilación).
- No hay test runner ni linter configurados en el backend.
- La base de datos vive en `pil-backend/pil_rrhh.db` (SQLite, se crea sola al arrancar).

### Frontend (`pil-frontend/`)
```bash
npm install
npm run dev       # Vite dev server, http://localhost:5173
npm run build     # build de producción
npm run lint      # oxlint
npm run preview   # sirve el build
```
- El frontend asume que el backend ya está corriendo en `http://localhost:3000` (URL hardcodeada en `src/api.js`, sin variables de entorno).
- No hay test runner configurado.

## Arquitectura

### Backend: Express + node:sqlite, sin capa de modelos
- `src/server.js` monta cuatro routers bajo `/api/*` y crea las tablas (vía `require("./db/database")`) antes de levantar el servidor.
- `src/db/database.js` es la única fuente de esquema: abre la conexión SQLite con `DatabaseSync` (API nativa de Node, no better-sqlite3 ni un ORM) y ejecuta `CREATE TABLE IF NOT EXISTS` para `trabajadores`, `asistencia` y `solicitudes`. Exporta la instancia `db` directamente — los routers llaman `db.prepare(...).get/all/run(...)` sin capa de repositorio/modelo intermedia.
- Cada archivo en `src/routes/` es autocontenido: valida el body a mano, consulta SQL inline, y devuelve JSON. No hay middleware de autenticación/autorización ni validación centralizada (los roles Trabajador/Supervisor/RRHH están documentados en el Word del proyecto pero no se aplican en código).
- `src/routes/reportes.js` es una vista agregada, no un módulo con tabla propia: junta `COUNT`/`AVG` de las otras tres tablas para armar indicadores (activos, ausentismo, retrasos, horas promedio, solicitudes por estado).
- Reglas de negocio a tener en cuenta al tocar `asistencia.js`: el retraso se calcula comparando `hora_entrada` como string contra la constante `HORA_ENTRADA_ESPERADA = "08:30"` (comparación lexicográfica, válida porque el formato es `HH:MM` de 24h); las horas trabajadas se calculan en `calcularHoras()` a partir de strings `HH:MM`, no de objetos `Date`.
- Las solicitudes solo pueden cambiar de estado una vez: `PUT /solicitudes/:id/estado` rechaza la transición si `estado !== 'pendiente'` (ver `solicitudes.js`).
- La baja de trabajador es lógica (`estado = 'inactivo'`), nunca se borra la fila — necesario porque `asistencia` y `solicitudes` tienen FK hacia `trabajadores`.

### Frontend: React 19 + Vite, sin router ni gestor de estado global
- `src/App.jsx` implementa navegación por pestañas con un array `PESTAÑAS` y `useState` — no hay React Router.
- `src/api.js` es la única capa de acceso a red: una función exportada por endpoint, todas usando `fetch` crudo contra `BASE_URL` y un helper común `manejarRespuesta()` que lanza si `res.ok` es falso. Los componentes en `src/components/` (`Personal`, `Asistencia`, `Solicitudes`, `Reportes`) llaman estas funciones directamente y manejan su propio estado de carga/error con hooks locales — no hay React Query ni Redux.
- No hay autenticación real ni enrutamiento por rol en el frontend; es un prototipo de demostración de los 4 módulos (Personal, Asistencia, Solicitudes, Reportes).

## Nomenclatura

El código (variables, campos de BD, mensajes de error, comentarios) está en español porque el dominio y el equipo lo están. Mantener ese idioma al extender rutas, componentes o el esquema — no mezclar con nombres en inglés a mitad de un módulo existente.
