# Prototipo RRHH - PIL Andina (Frontend)

## Requisitos
- Node.js instalado
- El backend (pil-backend) debe estar corriendo en http://localhost:3000

## Instalación y ejecución

```bash
npm install
npm run dev
```

Esto abre el frontend en `http://localhost:5173` (o el puerto que indique Vite).

## Estructura

- `src/api.js` — funciones que llaman a la API del backend
- `src/components/Personal.jsx` — módulo de Personal (CRUD)
- `src/components/Asistencia.jsx` — registro de entrada/salida y consultas
- `src/components/Solicitudes.jsx` — crear y aprobar/rechazar permisos y vacaciones
- `src/components/Reportes.jsx` — indicadores agregados (asistencia, ausentismo, solicitudes por estado)
- `src/App.jsx` — navegación por pestañas entre los cuatro módulos

## Notas
- Este prototipo no implementa login real; los roles (Trabajador/Supervisor/RRHH)
  están documentados en el Word del proyecto pero no se restringen en esta versión.
- Las 4 etapas de implementación planificadas están completas.
