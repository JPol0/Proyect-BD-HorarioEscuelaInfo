-- database/01-schema.sql
-- Estructura inicial de la Base de Datos

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS materias (
    cod_materia VARCHAR(40),
    nombre VARCHAR(100) NOT NULL,
    nro_secciones INT NOT NULL DEFAULT 1,
    horas_teo INT NOT NULL DEFAULT 0,
    horas_lab INT NOT NULL DEFAULT 0,
    semestre INT NOT NULL,
    modalidad VARCHAR(3) NOT NULL, -- 'PRE' o 'VIT'
    es_comun BOOLEAN NOT NULL DEFAULT FALSE,

    PRIMARY KEY (cod_materia)
);