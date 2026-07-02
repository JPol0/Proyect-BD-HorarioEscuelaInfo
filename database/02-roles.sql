-- Crear los roles en PostgreSQL
CREATE ROLE rol_lector;
CREATE ROLE rol_administrador;

-- Asignar permisos al rol Lector (solo lectura)
GRANT USAGE ON SCHEMA public TO rol_lector;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO rol_lector;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO rol_lector;

-- Asignar permisos al rol Administrador (todo)
GRANT USAGE, CREATE ON SCHEMA public TO rol_administrador;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rol_administrador;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rol_administrador;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO rol_administrador;
