# Backend — Proyecto Horario Escuela Info

API REST para la gestión de horarios escolares, términos académicos y alertas. Construida con **Node.js + Express 5** y **TypeScript**, siguiendo una **arquitectura hexagonal** (puertos y adaptadores).

## Arquitectura

```
src/
├── server.ts                    # Punto de entrada: Express app, CORS, /health
├── domain/                      # Entidades del negocio (Alert, Term, WeeklySchedule)
├── application/
│   ├── ports/                   # Interfaces de repositorio (contratos)
│   └── useCases/                # Casos de uso de la aplicación
└── infrastructure/
    ├── database/                # Implementaciones concretas de repositorios
    │   ├── JsonWeeklyScheduleRepository.ts
    │   ├── MockAlertRepository.ts
    │   └── MockTermRepository.ts
    └── http/                    # Capa HTTP (Express)
        ├── apiRouter.ts         # Monta rutas bajo /api
        ├── routes/              # Definición de rutas Express
        └── controllers/         # Controladores que orquestan casos de uso
```

### Capas

- **Domain**: entidades y tipos puros del negocio sin dependencias externas.
- **Application**: puertos (interfaces de repositorio) y casos de uso que orquestan la lógica.
- **Infrastructure**: implementaciones concretas de repositorios (mock/JSON) y la capa HTTP con Express.

### Endpoints

| Método | Ruta                    | Descripción                     |
|--------|-------------------------|---------------------------------|
| GET    | `/health`               | Health check del servidor       |
| GET    | `/api/terms`            | Listar términos académicos      |
| PATCH  | `/api/terms/:id/archive`| Archivar/desarchivar un término |
| POST   | `/api/terms`            | Crear un término                |
| GET    | `/api/weekly-schedule`  | Obtener horario semanal         |
| GET    | `/api/alerts/pending`   | Obtener alertas pendientes      |
| PATCH  | `/api/alerts/:id/state` | Actualizar estado de una alerta |

## Requisitos

- Node.js ≥ 18
- pnpm (recomendado) o npm

## Instalación

```bash
# Desde la raíz del monorepo
pnpm install

# O solo el backend
pnpm --filter backend install
```

## Ejecución en modo desarrollo (watching)

```bash
# Desde la raíz del monorepo
pnpm dev

# O solo el backend
pnpm --filter backend dev
```

Esto levanta el servidor con `tsx watch` en `http://localhost:3000` y se recarga automáticamente ante cambios.

## Compilación y producción

```bash
pnpm --filter backend build   # Compila TypeScript a dist/
pnpm --filter backend start   # Ejecuta el servidor compilado
```

## Linting

```bash
pnpm --filter backend lint        # Verificar
pnpm --filter backend lint:fix    # Corregir automáticamente
```

## Scripts disponibles

| Script       | Comando                        |
|-------------|--------------------------------|
| `dev`       | `tsx watch src/server.ts`      |
| `build`     | `tsc -p tsconfig.json`        |
| `start`     | `node dist/server.js`         |
| `lint`      | `eslint . --ext .ts`          |
| `lint:fix`  | `eslint . --ext .ts --fix`    |
