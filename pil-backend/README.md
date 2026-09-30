# Prototipo RRHH - PIL Andina (Backend)

## Requisitos
- Node.js v22.5 o superior (usa el módulo nativo `node:sqlite`, incluido en Node —
  no requiere instalar nada extra ni compiladores/Visual Studio)

## Instalación y ejecución

```bash
npm install
node src/server.js
```

Verás una advertencia de Node indicando que SQLite es experimental — es normal,
no afecta el funcionamiento:
`(node) ExperimentalWarning: SQLite is an experimental feature and might change at any time`

El servidor queda escuchando en `http://localhost:3000`. La base de datos SQLite
(`pil_rrhh.db`) se crea automáticamente en la raíz del proyecto la primera vez
que se ejecuta.

## Cargar datos de ejemplo (para la demo)

```bash
npm run seed
```

Esto borra los datos existentes y carga: 8 trabajadores (uno inactivo, para
probar la baja lógica), 5 días de asistencia con retrasos y ausencias
simuladas, y 6 solicitudes en distintos estados (pendiente, aprobado,
rechazado, cancelado). Ideal para que la vista de Reportes muestre números
representativos sin tener que cargar todo a mano desde el frontend.

Vuelve a correr `npm run seed` en cualquier momento para reiniciar los datos
de ejemplo a este mismo punto de partida.

## Endpoints disponibles (Etapa 1 - Módulo Personal)

| Método | Ruta                     | Descripción                                  |
|--------|--------------------------|-----------------------------------------------|
| GET    | /api/trabajadores        | Listar todos (opcional: ?buscar=texto)        |
| GET    | /api/trabajadores/:id    | Consultar un trabajador                       |
| POST   | /api/trabajadores        | Registrar un trabajador                       |
| PUT    | /api/trabajadores/:id    | Modificar un trabajador                       |
| DELETE | /api/trabajadores/:id    | Baja lógica (estado = inactivo)               |

### Ejemplo de registro (POST)

```bash
curl -X POST http://localhost:3000/api/trabajadores \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan","apellido":"Perez","ci":"1234567","cargo":"Operario","area":"Produccion","fecha_ingreso":"2024-01-15","tipo_contrato":"Indefinido"}'
```

## Endpoints disponibles (Etapa 2 - Asistencia y Solicitudes)

| Método | Ruta                              | Descripción                                             |
|--------|-----------------------------------|----------------------------------------------------------|
| POST   | /api/asistencia                   | Registrar entrada del día (calcula retraso automático)   |
| PUT    | /api/asistencia/:id/salida        | Registrar salida (calcula horas trabajadas)               |
| GET    | /api/asistencia                   | Consultar (?trabajador=id&fecha=YYYY-MM-DD o &mes=YYYY-MM)|
| POST   | /api/solicitudes                  | Crear solicitud de permiso o vacación                     |
| GET    | /api/solicitudes                  | Listar (?trabajador=id&estado=pendiente)                  |
| GET    | /api/solicitudes/:id              | Consultar una solicitud                                    |
| PUT    | /api/solicitudes/:id/estado       | Aprobar/rechazar/cancelar (body: estado, id_aprobador)     |

### Ejemplo: marcar entrada y salida

```bash
curl -X POST http://localhost:3000/api/asistencia \
  -H "Content-Type: application/json" \
  -d '{"id_trabajador":1,"fecha":"2026-09-12","hora_entrada":"08:45"}'

curl -X PUT http://localhost:3000/api/asistencia/1/salida \
  -H "Content-Type: application/json" \
  -d '{"hora_salida":"17:30"}'
```

### Ejemplo: crear y aprobar una solicitud

```bash
curl -X POST http://localhost:3000/api/solicitudes \
  -H "Content-Type: application/json" \
  -d '{"id_trabajador":1,"tipo":"vacacion","fecha_inicio":"2026-10-01","fecha_fin":"2026-10-10","motivo":"Vacacion anual"}'

curl -X PUT http://localhost:3000/api/solicitudes/1/estado \
  -H "Content-Type: application/json" \
  -d '{"estado":"aprobado","id_aprobador":1}'
```

## Próximas etapas
- (Ninguna pendiente de las etapas planificadas — las 4 etapas están completas)

## Endpoint de Reportes (Etapa 4)

| Método | Ruta                          | Descripción                                                   |
|--------|-------------------------------|-----------------------------------------------------------------|
| GET    | /api/reportes/resumen         | Indicadores agregados (opcional: ?mes=YYYY-MM)                   |

Devuelve: trabajadores activos, registrados/ausentes hoy, retrasos del mes,
promedio de horas del mes, y solicitudes agrupadas por estado. No tiene tabla
propia — se calcula a partir de trabajadores, asistencia y solicitudes.

```bash
curl http://localhost:3000/api/reportes/resumen
```
