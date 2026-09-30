# Proyecto PIL — Prototipo de Sistema de Gestión de RR.HH. (PIL Andina)

Prototipo académico de un sistema de gestión de Recursos Humanos para PIL Andina,
desarrollado como proyecto del subgrupo para la materia SIS303. Cubre cuatro
módulos: **Personal**, **Asistencia**, **Solicitudes** (permisos y vacaciones) y
**Reportes** (indicadores agregados de gestión).

## Estructura del repositorio

```
Proyecto-PIL/
├── pil-backend/    # API REST (Node.js + Express + SQLite)
└── pil-frontend/   # SPA (React + Vite)
```

Cada carpeta es un paquete npm independiente con su propio `package.json` y su
propio README con instrucciones detalladas:

- [`pil-backend/README.md`](pil-backend/README.md)
- [`pil-frontend/README.md`](pil-frontend/README.md)

## Tecnologías

- **Backend**: Node.js (v22.5+) con Express 5 y el módulo nativo `node:sqlite`
  (sin ORM ni dependencias de compilación).
- **Frontend**: React 19 + Vite, sin router ni gestor de estado global —
  navegación por pestañas y `fetch` directo contra la API.

## Puesta en marcha rápida

1. Backend (deja la API corriendo en `http://localhost:3000`):

   ```bash
   cd pil-backend
   npm install
   npm run seed       # opcional: carga datos de ejemplo para la demo
   node src/server.js
   ```

2. Frontend (en otra terminal, con el backend ya corriendo):

   ```bash
   cd pil-frontend
   npm install
   npm run dev
   ```

   Se abre en `http://localhost:5173` (o el puerto que indique Vite).

## Módulos

| Módulo | Descripción |
|--------|-------------|
| Personal | Registro, modificación, consulta y baja lógica de trabajadores. |
| Asistencia | Registro de entrada/salida, cálculo automático de retrasos y horas trabajadas. |
| Solicitudes | Creación y aprobación/rechazo/cancelación de permisos y vacaciones. |
| Reportes | Indicadores agregados: activos, ausentismo, retrasos, horas promedio y solicitudes por estado. |

## Notas

- Este prototipo no implementa login real; los roles (Trabajador/Supervisor/RRHH)
  están documentados en el Word del proyecto pero no se restringen en el código.
- Las 4 etapas de implementación planificadas están completas.
