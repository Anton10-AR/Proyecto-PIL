# Proyecto PIL — Sistema Integral de Gestión de RR.HH. (PIL Andina)

Prototipo académico (materia SIS303) del **Sistema Integral de Gestión y Digitalización de Recursos Humanos** para PIL Andina. Implementa los 6 módulos y los 4 roles definidos por el subgrupo de análisis en el documento del proyecto.

## Módulos

| # | Módulo | Qué hace |
|---|--------|----------|
| 1 | Gestión del personal | Alta, edición y baja lógica de trabajadores; cuentas de acceso; ficha con historial de asistencia, solicitudes, capacitaciones y evaluaciones; búsqueda y filtros por área, cargo y estado. |
| 2 | Asistencia, turnos, permisos y vacaciones | Turnos y feriados, marcación propia de entrada y salida, retrasos con tolerancia, ausencias; solicitudes de permisos y vacaciones con aprobación por etapas, saldo de vacaciones según la Ley General del Trabajo, archivos de respaldo y calendario. |
| 3 | Capacitación y desarrollo | Capacitaciones con cupo, inscripción por RRHH y propuestas del supervisor, resultados (asistencia, nota, aprobado o reprobado) y certificados. |
| 4 | Evaluación del desempeño | Plantillas con criterios ponderados (escala 1 a 5), períodos, evaluadores asignados, retroalimentación, lectura confirmada y plan de mejora con seguimiento. |
| 5 | Clima organizacional y comunicación | Encuestas anónimas por área, buzón de sugerencias (con anonimato opcional y código de seguimiento), comunicados y notificaciones dentro de la app. |
| 6 | Reportes e indicadores | Dashboard con los 5 indicadores del documento, gráficos, exportación a Excel, CSV y PDF, y respaldos manuales y diarios. |

## Roles

| Rol | Puede |
|-----|-------|
| Trabajador | Ver su ficha, marcar asistencia, pedir permisos y vacaciones, ver su capacitación y sus evaluaciones, responder encuestas, enviar sugerencias, ver sus indicadores. |
| Supervisor | Todo lo anterior, más ver a su equipo directo, aprobar la primera etapa de sus solicitudes, proponer participantes a capacitaciones y evaluar a quienes le asignen. |
| RRHH | Administrar todo: personal y cuentas, turnos, feriados, ausencias, correcciones, segunda etapa de aprobación, capacitaciones, plantillas y períodos de evaluación, encuestas, sugerencias, comunicados, reportes y respaldos. |
| Gerencia | Consultar todo, aprobar en un paso las solicitudes del personal de RRHH y de quienes no tienen supervisor, publicar comunicados y exportar reportes. |

El detalle de las decisiones de diseño, la matriz de permisos y las fases de implementación está en [`docs/plan-implementacion.md`](docs/plan-implementacion.md).

## Estructura

```
Proyecto-PIL/
├── pil-backend/    # API REST: Node.js + Express 5 + SQLite nativo (node:sqlite)
├── pil-frontend/   # SPA: React 19 + Vite + React Router
└── docs/           # Plan de implementación y decisiones
```

Cada carpeta es un paquete npm independiente con su propio README:
[`pil-backend/README.md`](pil-backend/README.md) · [`pil-frontend/README.md`](pil-frontend/README.md).

## Puesta en marcha

Requiere **Node.js 22.5 o superior**.

```bash
# 1. Backend (API en http://localhost:3000)
cd pil-backend
npm install
npm run seed          # carga datos de ejemplo (borra los existentes)
npm start

# 2. Frontend (en otra terminal; abre http://localhost:5173)
cd pil-frontend
npm install
npm run dev
```

## Usuarios de prueba

La contraseña inicial de cada cuenta es el **CI** del trabajador.

| Usuario | Rol | Contraseña | Para probar |
|---------|-----|-----------|-------------|
| `efernandez` | RRHH | 1109988 | Administración completa |
| `jsalinas` | Gerencia | 3456789 | Consulta, aprobación en un paso, exportar |
| `arojas` | Supervisor | 4521301 | Equipo de Producción, aprobar y evaluar |
| `lmamani` | Supervisor | 6672310 | Equipo de Calidad |
| `jperez` | Trabajador | 5891023 | Está de vacaciones esta semana |
| `rchoque` | Trabajador | 2219876 | Tiene solicitudes y una acción de mejora |
| `cvargas` | Trabajador | 7783456 | Sin supervisor: sus solicitudes van a Gerencia |
| `mlopez` | Trabajador | 3341987 | Debe cambiar la contraseña en el primer ingreso |

Las sugerencias anónimas de ejemplo se consultan con los códigos `DEMO2026` y `SUGE7K4P`.

## Pruebas

```bash
cd pil-backend && npm test     # reglas de negocio (node --test)
cd pil-frontend && npm run lint
```
