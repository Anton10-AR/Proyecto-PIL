# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repositorio

Este es un prototipo académico (proyecto PIL) de un sistema de RR.HH. para PIL Andina, compuesto por dos paquetes npm independientes sin workspace compartido: `pil-backend` (API) y `pil-frontend` (SPA). El repositorio está en GitHub (`origin` → `Anton10-AR/Proyecto-PIL`, rama `main`).

## Comandos

### Backend (`pil-backend/`)
```bash
npm install
node src/server.js     # arranca la API en http://localhost:3000
npm run seed            # recrea el esquema desde cero y carga datos de ejemplo (imprime los usuarios de prueba)
npm test                # node --test: pruebas de reglas de negocio en test/
```
- Requiere Node.js v22.5+ (usa el módulo nativo `node:sqlite`, sin dependencias de compilación).
- No hay linter configurado en el backend.
- Usuarios de prueba (contraseña inicial = CI): `efernandez` (rrhh), `jsalinas` (gerencia), `arojas`/`lmamani` (supervisor), `jperez` (trabajador), `mlopez` (trabajador con cambio de clave obligatorio).
- La base de datos vive en `pil-backend/pil_rrhh.db` (SQLite, se crea sola al arrancar).

### Frontend (`pil-frontend/`)
```bash
npm install
npm run dev       # Vite dev server, http://localhost:5173
npm run build     # build de producción
npm run lint      # oxlint
npm run preview   # sirve el build
```
- El frontend asume que el backend ya está corriendo en `http://localhost:3000` (URL hardcodeada en `src/api/cliente.js`, sin variables de entorno).
- No hay test runner configurado.

## Arquitectura

El sistema está en plena ampliación a 6 módulos y 4 roles (Trabajador, Supervisor, RRHH, Gerencia). El alcance acordado, la matriz de permisos y las fases están en `docs/plan-implementacion.md`: consultarlo antes de tocar cualquier módulo.

### Backend: Express + node:sqlite, sin capa de modelos
- `src/server.js` monta `/api/auth` (público) y luego aplica `autenticar` a todo `/api/*` antes de los demás routers.
- `src/db/esquema.js` es la única fuente de esquema (`crearEsquema(db)` y la lista `TABLAS`); `src/db/database.js` abre la conexión con `DatabaseSync` (API nativa de Node, no better-sqlite3 ni un ORM), la aplica y exporta la instancia `db` directamente — los routers llaman `db.prepare(...).get/all/run(...)` sin capa de repositorio/modelo intermedia. Como `CREATE TABLE IF NOT EXISTS` no altera tablas existentes, tras cambiar el esquema hay que correr `npm run seed`, que borra y recrea todas las tablas de `TABLAS`.
- Autenticación (`src/middleware/auth.js`): token opaco `Bearer`, del que solo se guarda el hash SHA-256 en `sesiones` (vence a las 8 h). `autenticar` deja en `req.usuario` la cuenta junto con los datos del trabajador, y bloquea con 403 `CAMBIAR_CLAVE` todo excepto `/api/auth/*` mientras `debe_cambiar_clave = 1`. `permitirRoles(...)` restringe por rol. Las contraseñas usan `scrypt` de `node:crypto` (`src/utils/claves.js`).
- Visibilidad por rol: `src/utils/visibilidad.js` (`idsVisibles`, `puedeVerTrabajador`, `filtroVisibilidad`). RRHH y Gerencia ven todo, el supervisor ve a sí mismo y a su equipo directo (`id_supervisor`), y el trabajador solo a sí mismo. Las rutas deben filtrar con este helper, no con lógica propia.
- Notificaciones: `src/utils/notificar.js` (`notificarTrabajador`, `notificarRol`, `notificarUsuario`). Los módulos lo llaman cuando ocurre algo que el usuario debe saber.
- Cada archivo en `src/routes/` es autocontenido: valida el body a mano, consulta SQL inline, y devuelve JSON. Solo la lógica compartida entre módulos va a `src/utils/`.
- `src/routes/reportes.js` es una vista agregada, no un módulo con tabla propia: junta `COUNT`/`AVG` de otras tablas para armar indicadores (activos, ausentismo, retrasos, horas promedio, solicitudes por estado). Se rehace en la Fase 7 con los indicadores del plan.
- Fechas y horas viajan como strings `YYYY-MM-DD` y `HH:MM` (24 h), en la hora local del servidor (se asume la zona de la empresa, America/La_Paz). Comparar estos strings lexicográficamente es válido. Las utilidades puras están en `src/utils/fechas.js` (`hoyLocal`, `calcularHoras`, `calcularRetraso`, `diaSemana` ISO, etc.) y tienen pruebas. Las marcas de tiempo visibles al usuario se guardan con `datetime('now', 'localtime')`; solo `sesiones.expira` está en UTC.
- Reglas de jornada (`src/utils/jornada.js`): `jornadaDelDia(idTrabajador, fecha)` devuelve el turno vigente (de `asignaciones_turno`), si es feriado y si el día es laborable. El retraso se mide contra `turno.hora_inicio`: dentro de la tolerancia global (`configuracion.tolerancia_minutos`) vale 0, y pasada la tolerancia cuentan todos los minutos. Si el día no es laborable, la marcación queda "fuera de turno" (`id_turno` y `minutos_retraso` en NULL). No hay turnos que crucen la medianoche.
- Asistencia: el trabajador marca su propia entrada y salida con la hora del servidor (`POST /asistencia/entrada|salida`). RRHH registra o corrige marcaciones siempre con una `observacion` obligatoria, y registra las ausencias a mano: solo en días laborables y sin marcación ese día. Una marcación y una ausencia del mismo día se excluyen mutuamente.
- Las solicitudes solo pueden cambiar de estado una vez: `PUT /solicitudes/:id/estado` rechaza la transición si `estado !== 'pendiente'` (ver `solicitudes.js`).
- La baja de trabajador es lógica (`estado = 'inactivo'`), nunca se borra la fila — necesario porque `asistencia` y `solicitudes` tienen FK hacia `trabajadores`.

### Frontend: React 19 + Vite + React Router, sin gestor de estado global
- Rutas con `react-router` (modo declarativo, `BrowserRouter` en `main.jsx`). `src/navegacion.js` define `MENU`: ruta, etiqueta, roles permitidos y componente. `App.jsx` genera las rutas a partir de `MENU` y `Layout` arma el menú lateral filtrado por rol. Para agregar una pantalla, se agrega una entrada a `MENU`; las subpáginas (ej. `/personal/:id`) llevan `enMenu: false`. Los componentes de un módulo con varias pantallas van en su propia carpeta (ej. `components/personal/`).
- `RutaProtegida` redirige a `/login` sin sesión, fuerza `/cambiar-clave` si `debe_cambiar_clave`, y valida los roles.
- Sesión: `contexto/AuthProvider.jsx` + `useAuth()`, con `useContext`, sin Redux. El token se guarda en `localStorage`.
- `src/api/` tiene un archivo por módulo. Todos usan `peticion()` de `src/api/cliente.js`, que agrega el token, lanza un `Error` con el mensaje del backend si `res.ok` es falso y emite `EVENTO_SESION_EXPIRADA` ante un 401. Los componentes llaman estas funciones directamente y manejan su propio estado de carga y error con hooks locales.
- `src/paginas/` contiene las pantallas propias del shell (Login, Inicio, CambiarClave); `src/components/` contiene los módulos y piezas comunes (Layout, Campana, RutaProtegida).

## Nomenclatura

El código (variables, campos de BD, mensajes de error, comentarios) está en español porque el dominio y el equipo lo están. Mantener ese idioma al extender rutas, componentes o el esquema — no mezclar con nombres en inglés a mitad de un módulo existente.
