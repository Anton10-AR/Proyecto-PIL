# Sistema de RR.HH. PIL Andina — Frontend

SPA con **React 19 + Vite + React Router**. Gráficos con **recharts**.

## Requisitos

- Node.js 22.5 o superior.
- El backend corriendo en `http://localhost:3000`. La URL está fija en `src/api/cliente.js`.

## Comandos

```bash
npm install
npm run dev       # servidor de desarrollo en http://localhost:5173
npm run build     # build de producción en dist/
npm run preview   # sirve el build
npm run lint      # oxlint
```

## Estructura

```
src/
├── main.jsx              # BrowserRouter + AuthProvider
├── App.jsx               # rutas generadas a partir de MENU
├── navegacion.js         # MENU: ruta, grupo, etiqueta, roles y componente de cada pantalla
├── roles.js · formato.js # nombres de roles; formato de fechas, estados y etiquetas
├── api/                  # un archivo por módulo; todos usan peticion() de cliente.js
├── contexto/             # sesión: AuthProvider + useAuth()
├── paginas/              # Login, Inicio, CambiarClave
└── components/
    ├── Layout.jsx, Campana.jsx, RutaProtegida.jsx
    ├── personal/  asistencia/  turnos/  solicitudes/  capacitaciones/
    └── evaluaciones/  comunicacion/  reportes/  configuracion/
```

## Convenciones

- **Pantallas nuevas:** se agregan como una entrada en `MENU` (`navegacion.js`), con los roles que pueden verla. Las subpáginas llevan `enMenu: false`.
- **Permisos:** el menú y las rutas se filtran por rol en el frontend, pero la autorización real la aplica siempre el backend. Los botones de acción dependen de las banderas que envía la API (`puede_editar`, `puede_decidir`, etc.).
- **Sesión:** el token se guarda en `localStorage`. Si la API responde 401, la sesión se cierra y la app vuelve al login.
- **Archivos protegidos:** se abren con `abrirArchivo()` o se bajan con `descargarArchivo()` de `cliente.js`, porque un enlace directo no envía el token.
- **Código diferido:** la página de Reportes, que incluye recharts, se carga con `React.lazy`.
- **Idioma:** todo el código y los textos están en español.
