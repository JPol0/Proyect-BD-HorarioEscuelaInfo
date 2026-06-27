# Frontend — SGBD Horarios

Aplicación web para la gestión de horarios académicos, términos y alertas de la Escuela de Informática de la UCAB. Construida con React, TypeScript, Vite y Tailwind CSS.

## Stack Tecnológico

| Herramienta        | Versión                           |
| ------------------ | --------------------------------- |
| React              | 19                                |
| TypeScript         | ~6.0                              |
| Vite               | ^8.0                              |
| Tailwind CSS       | 4.3                               |
| HeroUI             | 3.1                               |
| Icons              | @gravity-ui/icons                 |
| Linter             | ESLint + standard-with-typescript |
| Gestor de paquetes | pnpm (monorepo)                   |

## Arquitectura

El frontend sigue una **arquitectura hexagonal (clean architecture)** con tres capas + UI, donde las dependencias apuntan hacia adentro: la capa de dominio no conoce nada de las capas externas.

```
┌──────────────────────────────────────────────────┐
│  ui/       (pages + components)                  │
│  ┌────────────────────────────────────────────┐  │
│  │  core/application/     (use cases + ports) │  │
│  │  ┌──────────────────────────────────────┐  │  │
│  │  │  core/domain/   (entidades + tipos)  │  │  │
│  │  └──────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────┐  │
│  │  core/infrastructure/    (adapters HTTP)   │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
         │
         ▼  (fetch)
    Backend API
    localhost:3000/api
```

### Capas

#### 1. Dominio (`core/domain/`)

Entidades y tipos puros de TypeScript, sin dependencias externas.

| Archivo             | Exporta                                                                          |
| ------------------- | -------------------------------------------------------------------------------- |
| `Term.ts`           | `Term` — `{ id, name, startDate, endDate, archived }`                            |
| `Alarm.ts`          | `Alerta`, `EstadoAlerta` — `{ id, titulo, estado, descripcion?, motivoCambio? }` |
| `WeeklySchedule.ts` | `WeeklySchedule`, `DaysOfWeek`, `ScheduleRow` — estructura del horario semanal   |

#### 2. Aplicación (`core/application/`)

Contiene **puertos** (interfaces que definen el contrato con el mundo exterior) y **casos de uso** (orquestan la lógica de negocio).

**Puertos (`ports/`):**

| Puerto                     | Métodos                                                          |
| -------------------------- | ---------------------------------------------------------------- |
| `TermRepository`           | `getTerms()`, `createTerm(input)`, `toggleArchive(id, archived)` |
| `AlertRepository`          | `getAlarmsPending()`, `saveEstate(id, estado, motivo?)`          |
| `WeeklyScheduleRepository` | `getScheduleByTerm(term)`                                        |

**Casos de uso (`useCases/`):**

| Clase                      | `execute()`                               |
| -------------------------- | ----------------------------------------- |
| `GetTerms`                 | `(): Promise<Term[]>`                     |
| `CreateTerm`               | `(input: CreateTermInput): Promise<Term>` |
| `ToggleTermArchive`        | `(id, archived): Promise<void>`           |
| `ObtenerAlertasPendientes` | `(): Promise<Alerta[]>`                   |
| `GuardarEstadoAlerta`      | `(id, estado, motivo?): Promise<void>`    |
| `GetWeeklySchedule`        | `(term: string): Promise<WeeklySchedule>` |

Cada caso de uso recibe su repositorio por constructor (inyección de dependencias manual).

#### 3. Infraestructura (`core/infrastructure/adapters/`)

Implementaciones concretas de los puertos usando `fetch()` contra la API REST del backend.

| Adaptador                     | Implementa                 | Endpoint base                      |
| ----------------------------- | -------------------------- | ---------------------------------- |
| `HttpTermRepository`          | `TermRepository`           | `http://localhost:3000/api/terms`  |
| `HttpAlertRepository`         | `AlertRepository`          | `http://localhost:3000/api/alerts` |
| `ApiWeeklyScheduleRepository` | `WeeklyScheduleRepository` | `http://localhost:3000/api`        |

#### 4. UI (`ui/`)

Páginas y componentes que consumen los casos de uso. La inyección de dependencias se hace manualmente al instanciar los repositorios y casos de uso a nivel de módulo en cada página.

```
ui/
├── components/
│   ├── AlertCard.tsx       # Tarjeta individual de alerta (HeroUI)
│   ├── TermModal.tsx       # Modal para crear término académico
│   └── TitlePage.tsx       # Encabezado reutilizable (título + subtítulo)
└── pages/
    ├── TermsPage.tsx       # CRUD de términos académicos
    ├── AlarmCenter.tsx     # Centro de alertas y conflictos
    └── WeeklySchedulePage.tsx  # Visualización del horario semanal
```

### Enrutamiento

No se usa React Router. La navegación se maneja con un `useState<Pantalla>` en `App.tsx` que alterna entre las páginas mediante un menú lateral (sidebar). Las secciones _Materias_, _Profesores_ y _Laboratorios_ están deshabilitadas (en desarrollo).

### Estado

No se usa store global. Cada página maneja su propio estado local con `useState` y `useEffect`. Los datos se refrescan después de cada mutación llamando nuevamente al caso de uso correspondiente.

## Flujo de datos (ejemplo)

```
TermsPage
  │
  ├─ mount → useEffect → getTermsUseCase.execute()
  │                          └─ HttpTermRepository.getTerms()
  │                               └─ GET /api/terms
  │
  └─ crear término → createTermUseCase.execute(input)
                        └─ HttpTermRepository.createTerm(input)
                             └─ POST /api/terms
```

## Estilos

- **Tailwind CSS v4** vía plugin `@tailwindcss/vite`.
- **Tema personalizado** en `src/index.css` mediante directiva `@theme` (colores, fuentes, radios, animaciones).
- **HeroUI** (`@heroui/react`) usado en `AlertCard.tsx` (Card, Button, Select, TextArea).
- **Fuentes:** Inter (sans) y Hanken Grotesk (headings) desde Google Fonts.

## Scripts

| Comando         | Descripción                            |
| --------------- | -------------------------------------- |
| `pnpm dev`      | Inicia servidor de desarrollo (Vite)   |
| `pnpm build`    | TypeScript check + build de producción |
| `pnpm preview`  | Sirve build de producción localmente   |
| `pnpm lint`     | ESLint sobre archivos `.ts,.tsx`       |
| `pnpm lint:fix` | ESLint con auto-fix                    |

## Requisitos

- Node.js >= 18
- pnpm (gestor del monorepo)
- Backend corriendo en `http://localhost:3000`

## Desarrollo

```bash
# Desde la raíz del monorepo
pnpm install
pnpm --filter frontend dev
```
