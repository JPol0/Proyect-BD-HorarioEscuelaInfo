-- database/01-schema.sql
-- Estructura inicial de la Base de Datos

-- Creamos los Dominios necesarios
CREATE DOMAIN dom_rol_user as VARCHAR(20)
    DEFAULT 'lector'
    CHECK (VALUE IN ('administrador', 'lector'));

CREATE DOMAIN dom_semestre AS SMALLINT
    CHECK (VALUE BETWEEN 1 AND 12);

CREATE DOMAIN dom_modalidad AS VARCHAR(3)
    CHECK (VALUE IN ('PRE', 'VIT'));

CREATE DOMAIN dom_status_term AS VARCHAR(1)
    CHECK (VALUE IN ('A', 'D'));

CREATE DOMAIN dom_horas AS SMALLINT
    CHECK (VALUE >= 0);

CREATE DOMAIN dom_num_secciones AS SMALLINT
    CHECK (VALUE BETWEEN 1 AND 20);

--Dominios para tabla Profesores
CREATE DOMAIN dom_status_profesor AS VARCHAR(1)
    CHECK (VALUE IN ('A', 'P', 'R'));

--Dominios para tabla Warnings
CREATE DOMAIN dom_estado_warning AS VARCHAR(1)
    CHECK (VALUE IN ('I', 'P', 'R'));

--Dominios para tabla Horarios
CREATE DOMAIN dom_dia_horario AS VARCHAR(10)
    CHECK (VALUE IN ('Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'));

CREATE DOMAIN dom_hora_horario AS VARCHAR(2)
    CHECK (VALUE IN ('7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22'));

CREATE DOMAIN dom_prioridad_lab AS SMALLINT
    CHECK (VALUE IN (1, 2));

--Creación de Tabla Usuarios
CREATE TABLE IF NOT EXISTS Usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol dom_rol_user NOT NULL
);

-- Creación de Tabla Terms
CREATE TABLE IF NOT EXISTS Terms(
    CodTerm VARCHAR(30) NOT NULL,
    DescripcionT VARCHAR(150) NOT NULL,
    StatusT dom_status_term NOT NULL,
    
    PRIMARY KEY(CodTerm)
);

-- Creación de Tabla Plan de Estudio
CREATE TABLE IF NOT EXISTS Plan_de_Estudio(
    CodAsig VARCHAR(40) NOT NULL,
    CodTerm VARCHAR(30) NOT NULL,
    NombrePE VARCHAR(100) NOT NULL,
    EsComunPE BOOLEAN NOT NULL,
    SemestrePE dom_semestre NOT NULL,
    HoraPractica dom_horas NOT NULL,
    HoraTeorica dom_horas NOT NULL,
    HoraLaboratorio dom_horas NOT NULL,
    ModalidadPE dom_modalidad NOT NULL, -- PRE o VIT
    NroSeccionesPE dom_num_secciones NOT NULL,
    
    PRIMARY KEY (CodTerm,CodAsig),
    FOREIGN KEY(CodTerm) REFERENCES Terms(CodTerm) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Creación de Tabla Profesores
CREATE TABLE IF NOT EXISTS Profesores(
    CedulaP VARCHAR(10) NOT NULL,
    NombreP VARCHAR(100) NOT NULL,
    StatusP dom_status_profesor NOT NULL, -- Activo, Pausado, Reposo
    
    PRIMARY KEY (CedulaP)
);

-- Creación de Tabla Warnings
CREATE TABLE IF NOT EXISTS Warnings(
    CodWarning SERIAL NOT NULL,
    CodTerm VARCHAR(30) NOT NULL,
    FechaW TIMESTAMP NOT NULL, 
    EstadoW dom_estado_warning NOT NULL, -- Ignorado, Pendiente, Resuelto
    DescripcionW VARCHAR(250) NOT NULL,
    ComentarioW VARCHAR(250) NOT NULL,

    PRIMARY KEY(CodTerm,CodWarning),
    FOREIGN KEY(CodTerm) REFERENCES Terms(CodTerm) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Creación de Tabla Laboratorios
CREATE TABLE IF NOT EXISTS Laboratorios(
    CodLab SERIAL PRIMARY KEY,
    NombreLab VARCHAR(100) NOT NULL
);

-- Creación de Tabla Disponibilidad_Laboratorios

CREATE TABLE IF NOT EXISTS Disponibilidad_Laboratorio(
    CodLab SERIAL NOT NULL,
    Codterm Varchar(30) NOT NULL,
    Dia dom_dia_horario, 
    Hora dom_hora_horario,
    OcupadoD boolean NOT NULL,

    primary key (CodTerm,CodLab,Dia,Hora),
    FOREIGN KEY (CodTerm) REFERENCES Terms(CodTerm) on update cascade on delete cascade,
    FOREIGN KEY (CodLab) REFERENCES Laboratorios(CodLab) on update cascade on delete cascade
);


-- Creación de Tabla Secciones
CREATE TABLE IF NOT EXISTS Secciones(
    NroSeccion SERIAL NOT NULL,
    CodTerm VARCHAR(30) NOT NULL,
    CodAsig VARCHAR(40) NOT NULL,
    
    PRIMARY KEY(CodTerm,CodAsig,NroSeccion),
    FOREIGN KEY(CodTerm,CodAsig) REFERENCES Plan_de_Estudio(CodTerm,CodAsig) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Creación de Tabla Horarios
CREATE TABLE IF NOT EXISTS Horarios(
    NroSeccion SERIAL NOT NULL,
    CodTerm VARCHAR(30) NOT NULL,
    CodAsig VARCHAR(40) NOT NULL,
    DiaH dom_dia_horario NOT NULL,
    HoraH dom_hora_horario NOT NULL,
    CodLab SERIAL NOT NULL,

    PRIMARY KEY(CodTerm,CodAsig,NroSeccion,DiaH,HoraH),
    FOREIGN KEY(CodTerm,CodAsig,NroSeccion) REFERENCES Secciones(CodTerm,CodAsig,NroSeccion) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY(CodLab) REFERENCES Laboratorios(CodLab) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Creación de Tabla Disponibilidad_Horaria
CREATE TABLE IF NOT EXISTS Disponibilidad_Horaria(
    Codterm varchar(30) not null,
    CedulaP varchar(10) not null,
    Dia dom_dia_horario not null, 
    Hora dom_hora_horario not null,
    disponibilidad smallint check (disponibilidad = 1 or disponibilidad = 2 or disponibilidad =3),
    ocupadoDH boolean not null,

    primary key(CodTerm,CedulaP,Dia,Hora),


    FOREIGN KEY (Codterm) REFERENCES Terms(Codterm) on UPDATE cascade on delete cascade,
    FOREIGN key (CedulaP) REFERENCES Profesores(CedulaP)on UPDATE cascade on delete cascade

);

-- Creación de Tabla Imparten
CREATE TABLE IF NOT EXISTS Imparten(
    cedulaP Varchar(10) NOT NULL,
    CodAsig Varchar(40) NOT NULL,
    CodTerm Varchar(30) NOT NULL,
    NroSeccion SERIAL NOT NUlL,

    HorasLab dom_horas NOT NULL,
    HorasTeo dom_horas NOT NULL,
    Asignada BOOLEAN not null,

    primary key(cedulaP,CodAsig,CodTerm,NroSeccion),

    FOREIGN key(cedulaP) references Profesores(cedulaP) ON UPDATE CASCADE ON DELETE NO ACTION,
    foreign key (CodTerm,CodAsig,NroSeccion) references Secciones(CodTerm,CodAsig,NroSeccion) ON UPDATE CASCADE ON DELETE NO ACTION
);
-- Creación de Tabla Son_Ejerciodos
CREATE TABLE IF NOT EXISTS Son_ejercidos(
    CodLab SERIAL not null,
    CodAsig varchar(40) not null, 
    CodTerm varchar(30) not null,
    prioridad dom_prioridad_lab not null,
    primary key (CodLab,CodAsig,CodTerm),
    FOREIGN key(CodLab) references Laboratorios(CodLab) ON UPDATE CASCADE ON DELETE CASCADE,
    foreign key (CodAsig,CodTerm) references Plan_de_Estudio(CodAsig,CodTerm) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Creación de Tabla Prerrequisitos
CREATE TABLE IF NOT EXISTS Prerequitos(
    CodAsig varchar(40) not null,
    CodTerm varchar(30) not null,
    CodAsigPreq varchar(40) not null,
    CodTermPreq varchar(30) not null,
    primary key (CodAsig,CodTerm,CodAsigPreq,CodTermPreq),
    FOREIGN key (CodAsig,CodTerm) references Plan_de_Estudio(CodAsig,CodTerm) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN key (CodAsigPreq,CodTermPreq) references Plan_de_Estudio(CodAsig,CodTerm) ON UPDATE CASCADE ON DELETE CASCADE
);