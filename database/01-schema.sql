-- database/01-schema.sql
-- Estructura inicial de la Base de Datos

-- Creamos los Dominios necesarios

--Dominios para tabla materias
CREATE DOMAIN dom_modalidad AS VARCHAR(3)
CHECK (VALUE IN ('PRE', 'VIT'));

CREATE DOMAIN dom_status_term AS VARCHAR(1)
CHECK (VALUE IN ('A', 'D'));

CREATE DOMAIN dom_horas AS SMALLINT
CHECK (VALUE >= 0);

--Dominios para tabla Terms
CREATE DOMAIN dom_semestre AS SMALLINT
CHECK (VALUE BETWEEN 1 AND 12);

--Dominios para tabla Plan de Estudio
CREATE DOMAIN dom_num_secciones AS SMALLINT
CHECK (VALUE BETWEEN 1 AND 20);

--Creación de Tabla Usuarios
CREATE TABLE IF NOT EXISTS Usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'lector' CHECK (rol IN ('administrador', 'lector'))
);

-- creacion de tabla Terms
CREATE TABLE IF NOT EXISTS Terms(
    CodTerm VARCHAR(30) NOT NULL,
    DescripcionT VARCHAR(150) NOT NULL,
    StatusT dom_status_term NOT NULL,
    
    PRIMARY KEY(CodTerm)
);

-- creacion de tabla Plan de Estudio
CREATE TABLE IF NOT EXISTS Plan_de_Estudio(
    CodAsig VARCHAR(40) NOT NULL,
    CodTerm VARCHAR(30) NOT NULL,
    NroSeccionesPE dom_num_secciones NOT NULL,
    
    PRIMARY KEY(CodAsig, CodTerm),
    FOREIGN KEY(CodTerm) REFERENCES Terms(CodTerm) ON UPDATE CASCADE ON DELETE CASCADE
);

-- creacion de tabla Materias
CREATE TABLE IF NOT EXISTS Materias (
    CodAsig VARCHAR(40) NOT NULL,
    NombrePE VARCHAR(100) NOT NULL,
    HoraPractica dom_horas NOT NULL,
    HoraTeorica dom_horas NOT NULL,
    HoraLaboratorio dom_horas NOT NULL,
    SemestrePE dom_semestre NOT NULL,
    EsComunPE BOOLEAN NOT NULL,
    ModalidadPE dom_modalidad NOT NULL, -- PRE o VIT
    
    PRIMARY KEY (CodAsig),
    FOREIGN KEY (CodAsig) REFERENCES Plan_de_Estudio(CodAsig) ON UPDATE CASCADE ON DELETE CASCADE
);
