-- database/03-seed.sql
-- Datos de prueba iniciales para la base de datos

-- Usuarios
INSERT INTO Usuarios (nombre, password, rol) VALUES
('Luis Gordillo', 'gordillo123', 'administrador'),
('Ignacio Camburin', 'cambur123', 'lector'),
('KinJon Cora', 'kinjon123', 'lector'),
('Maria Rodriguez', 'maria456', 'lector'),
('Carlos Perez', 'carlos789', 'administrador')
ON CONFLICT (nombre) DO NOTHING;

-- Terms
INSERT INTO Terms (CodTerm, DescripcionT, StatusT) VALUES
('1', 'Segundo Semestre 2026', 'A'),
('2', 'Primer Semestre 2026', 'D'),
('3', 'Segundo Semestre 2025', 'D'),
('4', 'Primer Semestre 2025', 'D'),
('5', 'Segundo Semestre 2024', 'D')
ON CONFLICT (CodTerm) DO NOTHING;

-- Plan_de_Estudio
INSERT INTO Plan_de_Estudio (CodAsig, CodTerm, NombrePE, EsComunPE, SemestrePE, HoraPractica, HoraTeorica, HoraLaboratorio, ModalidadPE, NroSeccionesPE) VALUES
('EDO-1121', '1', 'Calculo I', FALSE, 1, 0, 4, 0, 'PRE', 3),
('PYE-2013', '1', 'Programacion orientada a objetos', FALSE, 3, 0, 4, 2, 'PRE', 1),
('CSU-1012', '1', 'Castellano', TRUE, 1, 0, 3, 0, 'PRE', 3),
('EDA-2053', '1', 'Estructura de Datos', FALSE, 3, 0, 3, 2, 'PRE', 1),
('BDD-3011', '1', 'Bases de Datos I', FALSE, 4, 0, 4, 2, 'PRE', 2),
('SO1-4011', '1', 'Sistemas Operativos I', FALSE, 5, 0, 4, 2, 'PRE', 2),
('EDO-1121', '2', 'Calculo I', FALSE, 1, 0, 4, 0, 'PRE', 2),
('PYE-2013', '2', 'Programacion orientada a objetos', FALSE, 3, 0, 4, 2, 'PRE', 2)
ON CONFLICT (CodTerm, CodAsig) DO NOTHING;

-- Profesores
INSERT INTO Profesores (CedulaP, NombreP, StatusP) VALUES
('V-12345678', 'Carlos Gomez', 'A'),
('V-87654321', 'Maria Rodriguez', 'A'),
('V-11223344', 'Jose Perez', 'P'),
('V-55667788', 'Ana Martinez', 'R'),
('V-99887766', 'Pedro Lopez', 'A')
ON CONFLICT (CedulaP) DO NOTHING;

-- Warnings
INSERT INTO Warnings (CodWarning, CodTerm, FechaW, EstadoW, DescripcionW, ComentarioW) VALUES
(1, '1', '2026-07-07 10:00:00', 'P', 'Conflicto de horario para el profesor Carlos Gomez', 'Revisar disponibilidad'),
(2, '1', '2026-07-07 10:30:00', 'I', 'Seccion 3 de Calculo I sin profesor asignado', 'Ignorado temporalmente'),
(3, '1', '2026-07-07 11:00:00', 'R', 'Superposicion de laboratorio Lab 1', 'Resuelto cambiando de aula'),
(4, '2', '2026-07-07 12:00:00', 'P', 'Exceso de horas para Maria Rodriguez', NULL),
(5, '3', '2026-07-07 13:00:00', 'P', 'Falta disponibilidad horaria para Jose Perez', NULL)
ON CONFLICT (CodTerm, CodWarning) DO NOTHING;

-- Laboratorios
INSERT INTO Laboratorios (CodLab, NombreLab) VALUES
(1, 'Laboratorio de Computacion 1'),
(2, 'Laboratorio de Computacion 2'),
(3, 'Laboratorio de Fisica'),
(4, 'Laboratorio de Quimica'),
(5, 'Laboratorio de Redes')
ON CONFLICT (CodLab) DO NOTHING;

-- Disponibilidad_Laboratorio
INSERT INTO Disponibilidad_Laboratorio (CodLab, Codterm, Dia, Hora, OcupadoD) VALUES
(1, '1', 'Lunes', '7', FALSE),
(1, '1', 'Lunes', '8', TRUE),
(2, '1', 'Martes', '9', FALSE),
(3, '1', 'Miercoles', '10', TRUE),
(4, '1', 'Jueves', '11', FALSE),
(5, '1', 'Viernes', '12', TRUE)
ON CONFLICT (CodTerm, CodLab, Dia, Hora) DO NOTHING;

-- Secciones
INSERT INTO Secciones (CodTerm, CodAsig, NroSeccion) VALUES
('1', 'EDO-1121', 1),
('1', 'EDO-1121', 2),
('1', 'PYE-2013', 1),
('1', 'CSU-1012', 1),
('1', 'EDA-2053', 1),
('1', 'BDD-3011', 1),
('1', 'SO1-4011', 1)
ON CONFLICT (CodTerm, CodAsig, NroSeccion) DO NOTHING;

-- Horarios
INSERT INTO Horarios (CodTerm, CodAsig, NroSeccion, DiaH, HoraH, CodLab) VALUES
('1', 'EDO-1121', 1, 'Lunes', '7', NULL),
('1', 'EDO-1121', 1, 'Lunes', '8', NULL),
('1', 'PYE-2013', 1, 'Martes', '9', 1),
('1', 'CSU-1012', 1, 'Miercoles', '11', NULL),
('1', 'EDA-2053', 1, 'Jueves', '13', 2),
('1', 'BDD-3011', 1, 'Viernes', '15', 3)
ON CONFLICT (CodTerm, CodAsig, NroSeccion, DiaH, HoraH) DO NOTHING;

-- Disponibilidad_Horaria
INSERT INTO Disponibilidad_Horaria (CodTerm, CedulaP, Dia, Hora, disponibilidad, ocupadoDH) VALUES
('1', 'V-12345678', 'Lunes', '7', 2, TRUE),
('1', 'V-12345678', 'Lunes', '8', 2, TRUE),
('1', 'V-87654321', 'Martes', '9', 1, FALSE),
('1', 'V-11223344', 'Miercoles', '10', 0, FALSE),
('1', 'V-55667788', 'Jueves', '11', 1, FALSE),
('1', 'V-99887766', 'Viernes', '12', 2, TRUE)
ON CONFLICT (CodTerm, CedulaP, Dia, Hora) DO NOTHING;

-- Imparten
INSERT INTO Imparten (cedulaP, CodAsig, CodTerm, NroSeccion, HorasLab, HorasTeo, Asignada) VALUES
('V-12345678', 'EDO-1121', '1', 1, 0, 4, TRUE),
('V-87654321', 'PYE-2013', '1', 1, 2, 4, TRUE),
('V-11223344', 'CSU-1012', '1', 1, 0, 3, TRUE),
('V-55667788', 'EDA-2053', '1', 1, 2, 3, TRUE),
('V-99887766', 'BDD-3011', '1', 1, 2, 4, TRUE)
ON CONFLICT (cedulaP, CodAsig, CodTerm, NroSeccion) DO NOTHING;

-- Son_ejercidos
INSERT INTO Son_ejercidos (CodLab, CodAsig, CodTerm, prioridad) VALUES
(1, 'PYE-2013', '1', 1),
(2, 'EDA-2053', '1', 1),
(3, 'BDD-3011', '1', 1),
(4, 'SO1-4011', '1', 2),
(5, 'PYE-2013', '1', 2)
ON CONFLICT (CodTerm, CodAsig, CodLab) DO NOTHING;

-- Prerequitos
INSERT INTO Prerequitos (CodAsig, CodTerm, CodAsigPreq, CodTermPreq) VALUES
('PYE-2013', '1', 'EDO-1121', '1'),
('EDA-2053', '1', 'PYE-2013', '1'),
('BDD-3011', '1', 'PYE-2013', '1'),
('SO1-4011', '1', 'EDA-2053', '1'),
('BDD-3011', '1', 'EDO-1121', '1')
ON CONFLICT (CodAsig, CodTerm, CodAsigPreq, CodTermPreq) DO NOTHING;
