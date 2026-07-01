# Sistema de Gestión de Horarios - Escuela de Informática

Este proyecto es un sistema de gestión de horarios diseñado para la Escuela de Informática. Está estructurado como un monorepo administrado con `pnpm` workspaces, y consta de una aplicación frontend moderna (Vite + React) y una API backend (Express).

## Requisitos Previos

Asegúrate de tener instalados los siguientes componentes en tu sistema antes de comenzar:

- **Node.js** (versión LTS recomendada)
- **pnpm** (versión 10.x o superior)
- **Docker** y **Docker Compose**

---

## Base de Datos (PostgreSQL en Docker)

El proyecto utiliza una base de datos PostgreSQL que corre dentro de un contenedor Docker. La configuración del servicio se encuentra en [docker-compose.yml].
### 1. Configuración de Variables de Entorno

Antes de iniciar el contenedor, debes crear y configurar tus variables de entorno para que Docker compose y la aplicación web puedan conectarse a la base de datos.

Puedes basarte en el archivo [.env.example]:

1. Copia el archivo de ejemplo y nómbralo `.env`:
   ```bash
   cp .env.example .env
   ```
2. Modifica los valores en el archivo `.env` según tus preferencias locales.

### 2. Comandos para Gestionar la Base de Datos con Docker

Se han configurado scripts de utilidad en el [package.json] raíz para no tener que escribir los comandos de Docker largos manualmente:

* **Levantar la base de datos** (en segundo plano / detached mode):
  ```bash
  pnpm db:up
  ```
  > [!NOTE]
  > Al levantar la base de datos por primera vez, Docker ejecutará automáticamente los scripts SQL ubicados en el directorio [database/]

* **Ver los registros/logs de la base de datos**:
  ```bash
  pnpm db:logs
  ```

* **Detener la base de datos** (libera puertos y detiene el contenedor sin borrar los datos del volumen persistente):
  ```bash
  pnpm db:down
  ```

---

## Desarrollo Local

Para poner en marcha todo el entorno de desarrollo local (Base de Datos, Backend y Frontend):

1. **Instalar dependencias del monorepo** (ejecutar en la raíz):
   ```bash
   pnpm install
   ```
2. **Iniciar la base de datos en Docker**:
   ```bash
   pnpm db:up
   ```
3. **Correr los entornos de desarrollo simultáneamente**:
   ```bash
   pnpm dev
   ```
   * Esto iniciará tanto el frontend en `http://localhost:5173` (o el puerto configurado por Vite) como el backend en `http://localhost:3000` (o el onfigurado en la variable `PORT`).

---

## Estructura del Monorepo

El proyecto consta de la siguiente estructura modular:

* **[database/]**: Contiene la definición de esquemas SQL e inserciones de semillas para PostgreSQL.
* **[backend/]**: API REST estructurada bajo Arquitectura Hexagonal.
* **[frontend/]**: Cliente React SPA con componentes `@heroui/react` y Tailwind CSS.

Para más detalles acerca de la arquitectura del proyecto, lineamientos de código y comandos específicos de desarrollo, consulta el archivo [AGENTS.md]
