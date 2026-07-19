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
('2026-25', 'Simulacion de Semestre', 'A')
ON CONFLICT (CodTerm) DO NOTHING;

-- Plan_de_Estudio
INSERT INTO Plan_de_Estudio (CodAsig, CodTerm, NombrePE, EsComunPE, SemestrePE, HoraPractica, HoraTeorica, HoraLaboratorio, ModalidadPE, NroSeccionesPE) 
VALUES
('FING-02002', '2026-25', 'Álgebra y Trigonometría', TRUE, 1, 2, 2, 0, 'PRE', 1),
('ADCO-00350', '2026-25', 'Principios de Marketing', TRUE, 1, 0, 3, 0, 'PRE', 1),
('FING-02009', '2026-25', 'Lógica', TRUE, 1, 2, 1, 0, 'PRE', 1),
('FING-02008', '2026-25', 'Fundamentos de Programación', TRUE, 1, 0, 0, 3, 'PRE', 1),
('UCAB-00009', '2026-25', 'Competencia Textual en Español', TRUE, 1, 3, 1, 0, 'PRE', 1),
('UCAB-00001', '2026-25', 'Identidad, Liderazgo y Compromiso I', TRUE, 1, 1, 1, 0, 'PRE', 1),
('FING-02003', '2026-25', 'Cálculo Diferencial', TRUE, 2, 3, 2, 0, 'PRE', 1),
('FING-02001', '2026-25', 'Álgebra Lineal', TRUE, 2, 3, 2, 0, 'PRE', 1),
('INFO-02000', '2026-25', 'Matemáticas Discretas', FALSE, 2, 3, 2, 0, 'PRE', 1),
('INFO-02001', '2026-25', 'Algoritmos y Programación', FALSE, 2, 0, 0, 3, 'PRE', 1),
('INFO-02002', '2026-25', 'Algoritmos y Estructuras de Datos', FALSE, 2, 2, 2, 2, 'PRE', 1),
('UCAB-00002', '2026-25', 'Identidad, Liderazgo y Compromiso II', TRUE, 2, 1, 1, 0, 'PRE', 1),
('FING-02004', '2026-25', 'Cálculo Integral', TRUE, 3, 2, 2, 0, 'PRE', 1),
('FING-00011', '2026-25', 'Física General', TRUE, 3, 3, 2, 0, 'PRE', 1),
('UCAB-00003', '2026-25', 'Ecología, Ambiente y Sustentabilidad', TRUE, 3, 1, 1, 0, 'PRE', 1),
('INFO-02003', '2026-25', 'Programación Orientada a Objetos', FALSE, 3, 2, 2, 2, 'PRE', 1),
('FACE-00024', '2026-25', 'Contabilidad Financiera', TRUE, 3, 2, 2, 0, 'PRE', 1),
('INFO-02004', '2026-25', 'Sistemas de Información', FALSE, 3, 1, 2, 0, 'PRE', 1),
('UCAB-00008', '2026-25', 'Innovación y Emprendimiento', TRUE, 3, 1, 1, 0, 'VIT', 1),
('FING-02005', '2026-25', 'Cálculo Vectorial', TRUE, 4, 2, 2, 0, 'PRE', 1),
('FING-02006', '2026-25', 'Ecuaciones Diferenciales Ordinarias', TRUE, 4, 1, 2, 0, 'PRE', 1),
('FING-00014', '2026-25', 'Ingeniería Económica', TRUE, 4, 1, 2, 0, 'PRE', 1),
('INFO-02005', '2026-25', 'Organización del Computador', FALSE, 4, 2, 2, 0, 'PRE', 1),
('INFO-02006', '2026-25', 'Programación Orientada a la Web', FALSE, 4, 0, 0, 3, 'PRE', 1),
('INFO-02007', '2026-25', 'Ingeniería de Software', FALSE, 4, 2, 2, 0, 'PRE', 1),
('INFO-02008', '2026-25', 'Interacción Humano-Computador', FALSE, 4, 2, 2, 0, 'PRE', 1),
('FING-02007', '2026-25', 'Electricidad y Magnetismo', TRUE, 5, 3, 2, 0, 'PRE', 1),
('FING-02013', '2026-25', 'Laboratorio de Física', FALSE, 5, 0, 0, 2, 'PRE', 1),
('FING-02011', '2026-25', 'Probabilidad y Estadística', TRUE, 5, 2, 2, 0, 'PRE', 1),
('INFO-02010', '2026-25', 'Sistemas Operativos', FALSE, 5, 2, 2, 0, 'PRE', 1),
('INFO-02011', '2026-25', 'Tópicos Especiales de Programación', FALSE, 5, 0, 0, 3, 'PRE', 1),
('INFO-02012', '2026-25', 'Sistemas de Bases de Datos', FALSE, 5, 3, 2, 0, 'PRE', 1),
('INFO-02013', '2026-25', 'Gestión de Proyectos de Software', FALSE, 5, 1, 2, 0, 'VIT', 1),
('FING-02010', '2026-25', 'Métodos Numéricos', TRUE, 6, 2, 0, 0, 'PRE', 1),
('INFO-02014', '2026-25', 'Inglés I', FALSE, 6, 0, 1, 2, 'PRE', 1),
('INFO-02015', '2026-25', 'Arquitectura del Computador Aplicada', FALSE, 6, 2, 2, 2, 'PRE', 1),
('INFO-02016', '2026-25', 'Redes de Comunicación de Datos', FALSE, 6, 1, 2, 2, 'PRE', 1),
('INFO-02017', '2026-25', 'Tópicos Especiales para la Gestión de Datos', FALSE, 6, 1, 2, 0, 'PRE', 1),
('INFO-02018', '2026-25', 'Ingeniería de Requisitos', FALSE, 6, 1, 2, 0, 'PRE', 1),
('INFO-02019', '2026-25', 'Aseguramiento de la Calidad del Software', FALSE, 6, 1, 2, 0, 'PRE', 1),
('INFO-02020', '2026-25', 'Inteligencia Artificial: Aprendizaje Automático', FALSE, 7, 0, 0, 4, 'PRE', 1),
('INFO-02021', '2026-25', 'Inglés II', FALSE, 7, 0, 1, 2, 'PRE', 1),
('INFO-02022', '2026-25', 'Investigación de Operaciones', FALSE, 7, 2, 2, 0, 'PRE', 1),
('INFO-02023', '2026-25', 'Ciberseguridad', FALSE, 7, 0, 2, 2, 'PRE', 1),
('INFO-02024', '2026-25', 'Inteligencia de Negocios', TRUE, 7, 0, 0, 3, 'PRE', 1),
('INFO-02025', '2026-25', 'Desarrollo de Software', FALSE, 7, 2, 2, 0, 'PRE', 1),
('FING-00009', '2026-25', 'Ética Profesional', TRUE, 8, 1, 1, 0, 'VIT', 1),
('INFO-02026', '2026-25', 'Inglés Técnico', FALSE, 8, 2, 1, 0, 'VIT', 1),
('INFO-02027', '2026-25', 'Evaluación de Sistemas Informáticos', FALSE, 8, 1, 2, 0, 'VIT', 1),
('INFO-02028', '2026-25', 'Computación en la Nube', FALSE, 8, 2, 2, 0, 'PRE', 1),
('INFO-02029', '2026-25', 'Arquitecturas Empresariales', FALSE, 8, 1, 2, 0, 'PRE', 1)
ON CONFLICT (CodTerm, CodAsig) DO NOTHING;

-- Profesores
-- Profesores extraídos del horario de Ingeniería Informática
INSERT INTO Profesores (CedulaP, NombreP, StatusP) VALUES
('V-20000001', 'Bianco Faenza, Sara Cristina', 'A'),
('V-20000002', 'Nidia Marcano', 'A'),
('V-20000003', 'Noel Cuba', 'A'),
('V-20000004', 'Fonseca Droy, José Francisco', 'A'),
('V-20000005', 'Ferrer de Rojas, Maria', 'A'),
('V-20000006', 'Di Scipio Marcano, Dilia Elinor', 'A'),
('V-20000007', 'Quliada de Murcano, Damaris del Valle', 'A'),
('V-20000008', 'Barrios Anthony', 'A'),
('V-20000009', 'Rodriguez Roman', 'A'),
('V-20000010', 'Gutiérrez Tovar, Yoel Emilio', 'A'),
('V-20000011', 'Noiralyh Vasques', 'A'),
('V-20000012', 'Aramendi González, Claudia Helena', 'A'),
('V-20000013', 'Bello Chirino, Jannelly Carolina', 'A'),
('V-20000014', 'Diaz Peñaloza, Zulma Elizabeth', 'A'),
('V-20000015', 'Cordero Rivero, Florencia Esperanza', 'A'),
('V-20000016', 'Morao R, Gonzalo G', 'A'),
('V-20000017', 'González Altuna, Hirwing del Carmen', 'A'),
('V-20000018', 'González Brave, Yael Modeste', 'A'),
('V-20000019', 'Sulbarán Hereira, Werner José', 'A'),
('V-20000020', 'Aponte Castillo, Scampola Carolina', 'A'),
('V-20000021', 'Garcia Castro, Wladimir', 'A'),
('V-20000022', 'Lanz Rodriguez, Adriana Carolina', 'A'),
('V-20000023', 'Barrios Álvarez, Jesús Enrique', 'A'),
('V-20000024', 'Rondón Flores, Jesús Manuel', 'A'),
('V-20000025', 'Lárez Mata, Jesús José', 'A'),
('V-20000026', 'Mora Montaño, Noraimar Yarin', 'A'),
('V-20000027', 'Cabareda Rondón, Luis Antoni', 'A'),
('V-20000028', 'Méndez Rojas, Nancy Mariela', 'A'),
('V-20000029', 'Urdaneta Ponte, Maria Cora', 'A'),
('V-20000030', 'Bello Castillo, Franklin Bismar', 'A'),
('V-20000031', 'Salazar Sánchez, Magby Jusmiry', 'A'),
('V-20000032', 'Garcia Rivero, Homer Alesander', 'A'),
('V-20000033', 'Bemúdez de Romero, Lusmita Maria', 'A'),
('V-20000034', 'Castro, Omar Enrique', 'A'),
('V-20000035', 'Lobo Maldonado, Eladio José', 'A'),
('V-20000036', 'Madrid Rodriguez, Juan Aldemaro', 'A'),
('V-20000037', 'Dávila Marcano, Andreina del Valle', 'A'),
('V-20000038', 'Borjas Medina, Livia Carolina', 'A'),
('V-20000039', 'Martinez Aquino, Maxwel Eduardo', 'A'),
('V-20000040', 'Silva Briceño, Romel Felipe', 'A'),
('V-20000041', 'Renaud Pascual, Oriana Marisela', 'A'),
('V-20000042', 'Medina Cuida, Lur Esperanza', 'A'),
('V-20000043', 'Narváez González de Pereira, Mayra Celenia', 'A'),
('V-20000044', 'Constantino Antonaquio Antonio', 'A'),
('V-20000045', 'Braulio Algoritmos', 'A'),
('V-20000046', 'Edwin Fisica', 'A'),
('V-20000047', 'Profesor Integral', 'A')
ON CONFLICT (CedulaP) DO NOTHING;

-- Warnings
INSERT INTO Warnings (CodWarning, CodTerm, FechaW, EstadoW, DescripcionW, ComentarioW) VALUES
(1, '2026-25', '2026-07-07 10:00:00', 'P', 'Conflicto de horario para el profesor Carlos Gomez', 'Revisar disponibilidad'),
(2, '2026-25', '2026-07-07 10:30:00', 'I', 'Seccion 3 de Calculo I sin profesor asignado', 'Ignorado temporalmente'),
(3, '2026-25', '2026-07-07 11:00:00', 'R', 'Superposicion de laboratorio Lab 1', 'Resuelto cambiando de aula'),
(4, '2026-25', '2026-07-07 12:00:00', 'P', 'Exceso de horas para Maria Rodriguez', NULL),
(5, '2026-25', '2026-07-07 13:00:00', 'P', 'Falta disponibilidad horaria para Jose Perez', NULL)
ON CONFLICT (CodTerm, CodWarning) DO NOTHING;

-- Laboratorios
INSERT INTO Laboratorios (CodLab, NombreLab) VALUES
(1, 'Laboratorio de Computacion 1'),
(2, 'Laboratorio de Computacion 2'),
(3, 'Laboratorio de Base de Datos'),
(4, 'Laboratorio de Aplicaciones Moviles'),
(5, 'Laboratorio de Redes'),
(6, 'Laboratorio de Circuitos Electricos')
ON CONFLICT (CodLab) DO NOTHING;

-- Secciones
INSERT INTO Secciones (CodTerm, CodAsig, NroSeccion) VALUES
('2026-25', 'FING-02002', 1),
('2026-25', 'ADCO-00350', 1),
('2026-25', 'FING-02009', 1),
('2026-25', 'FING-02008', 1),
('2026-25', 'UCAB-00009', 1),
('2026-25', 'UCAB-00001', 1),
('2026-25', 'FING-02003', 1),
('2026-25', 'FING-02001', 1),
('2026-25', 'INFO-02000', 1),
('2026-25', 'INFO-02001', 1),
('2026-25', 'INFO-02002', 1),
('2026-25', 'UCAB-00002', 1),
('2026-25', 'FING-02004', 1),
('2026-25', 'FING-00011', 1),
('2026-25', 'UCAB-00003', 1),
('2026-25', 'INFO-02003', 1),
('2026-25', 'FACE-00024', 1),
('2026-25', 'INFO-02004', 1),
('2026-25', 'UCAB-00008', 1),
('2026-25', 'FING-02005', 1),
('2026-25', 'FING-02006', 1),
('2026-25', 'FING-00014', 1),
('2026-25', 'INFO-02005', 1),
('2026-25', 'INFO-02006', 1),
('2026-25', 'INFO-02007', 1),
('2026-25', 'INFO-02008', 1),
('2026-25', 'FING-02007', 1),
('2026-25', 'FING-02013', 1),
('2026-25', 'FING-02011', 1),
('2026-25', 'INFO-02010', 1),
('2026-25', 'INFO-02011', 1),
('2026-25', 'INFO-02012', 1),
('2026-25', 'INFO-02013', 1),
('2026-25', 'FING-02010', 1),
('2026-25', 'INFO-02014', 1),
('2026-25', 'INFO-02015', 1),
('2026-25', 'INFO-02016', 1),
('2026-25', 'INFO-02017', 1),
('2026-25', 'INFO-02018', 1),
('2026-25', 'INFO-02019', 1),
('2026-25', 'INFO-02020', 1),
('2026-25', 'INFO-02021', 1),
('2026-25', 'INFO-02022', 1),
('2026-25', 'INFO-02023', 1),
('2026-25', 'INFO-02024', 1),
('2026-25', 'INFO-02025', 1),
('2026-25', 'FING-00009', 1),
('2026-25', 'INFO-02026', 1),
('2026-25', 'INFO-02027', 1),
('2026-25', 'INFO-02028', 1),
('2026-25', 'INFO-02029', 1)
ON CONFLICT (CodTerm, CodAsig, NroSeccion) DO NOTHING;

-- Horarios
INSERT INTO Horarios (CodTerm, CodAsig, NroSeccion, DiaH, HoraH, CodLab) VALUES
('2026-25', 'FING-02002', 1, 'Lunes', '7', NULL),
('2026-25', 'FING-02002', 1, 'Lunes', '8', NULL),
('2026-25', 'ADCO-00350', 1, 'Martes', '9', 1),
('2026-25', 'FING-02009', 1, 'Miercoles', '11', NULL),
('2026-25', 'FING-02008', 1, 'Jueves', '13', 2),
('2026-25', 'UCAB-00009', 1, 'Viernes', '15', 3)
ON CONFLICT (CodTerm, CodAsig, NroSeccion, DiaH, HoraH) DO NOTHING;

-- Disponibilidad_Horaria
INSERT INTO Disponibilidad_Horaria (CodTerm, CedulaP, Dia, Hora, disponibilidad, ocupadoDH) VALUES
('2026-25', 'V-12345678', 'Lunes', '7', 2, TRUE),
('2026-25', 'V-12345678', 'Lunes', '8', 2, TRUE),
('2026-25', 'V-87654321', 'Martes', '9', 1, FALSE),
('2026-25', 'V-11223344', 'Miercoles', '10', 0, FALSE),
('2026-25', 'V-55667788', 'Jueves', '11', 1, FALSE),
('2026-25', 'V-99887766', 'Viernes', '12', 2, TRUE)
ON CONFLICT (CodTerm, CedulaP, Dia, Hora) DO NOTHING;

-- Imparten
INSERT INTO Imparten (cedulaP, CodAsig, CodTerm, NroSeccion, HorasLab, HorasTeo, Asignada) VALUES
('V-12345678', 'FING-02002', '2026-25', 1, 0, 4, TRUE),
('V-87654321', 'ADCO-00350', '2026-25', 1, 2, 4, TRUE),
('V-11223344', 'FING-02009', '2026-25', 1, 0, 3, TRUE),
('V-55667788', 'FING-02008', '2026-25', 1, 2, 3, TRUE),
('V-99887766', 'UCAB-00009', '2026-25', 1, 2, 4, TRUE)
ON CONFLICT (cedulaP, CodAsig, CodTerm, NroSeccion) DO NOTHING;

-- Son_ejercidos
INSERT INTO Son_ejercidos (CodLab, CodAsig, CodTerm, prioridad) VALUES
(1, 'FING-02011', '2026-25', 1),
(2, 'INFO-02002', '2026-25', 1),
(3, 'INFO-02012', '2026-25', 1),
(4, 'INFO-02010', '2026-25', 2),
(5, 'FING-02011', '2026-25', 2)
ON CONFLICT (CodTerm, CodAsig, CodLab) DO NOTHING;

-- Prerequitos
INSERT INTO Prerequitos (CodAsig, CodTerm, CodAsigPreq, CodTermPreq) VALUES
('FING-02003', '2026-25', 'FING-02002', '2026-25'),
('FING-02001', '2026-25', 'FING-02002', '2026-25'),
('INFO-02000', '2026-25', 'FING-02009', '2026-25'),
('INFO-02001', '2026-25', 'FING-02008', '2026-25'),
('INFO-02002', '2026-25', 'INFO-02001', '2026-25'),
('UCAB-00002', '2026-25', 'UCAB-00001', '2026-25'),
('FING-02004', '2026-25', 'FING-02003', '2026-25'),
('FING-00011', '2026-25', 'FING-02003', '2026-25'),
('FING-02005', '2026-25', 'FING-02004', '2026-25'),
('FING-02006', '2026-25', 'FING-02004', '2026-25'),
('FING-00014', '2026-25', 'FACE-00024', '2026-25'),
('INFO-02005', '2026-25', 'INFO-02000', '2026-25'),
('INFO-02006', '2026-25', 'INFO-02003', '2026-25'),
('INFO-02007', '2026-25', 'INFO-02004', '2026-25'),
('INFO-02008', '2026-25', 'INFO-02007', '2026-25'),
('FING-02007', '2026-25', 'FING-00011', '2026-25'),
('FING-02013', '2026-25', 'FING-02007', '2026-25'),
('FING-02011', '2026-25', 'FING-02004', '2026-25'),
('INFO-02010', '2026-25', 'INFO-02005', '2026-25'),
('INFO-02011', '2026-25', 'INFO-02003', '2026-25'),
('INFO-02013', '2026-25', 'FING-00014', '2026-25'),
('INFO-02013', '2026-25', 'INFO-02013', '2026-25'),
('FING-02010', '2026-25', 'FING-02005', '2026-25'),
('INFO-02015', '2026-25', 'FING-02007', '2026-25'),
('INFO-02016', '2026-25', 'INFO-02010', '2026-25'),
('INFO-02017', '2026-25', 'INFO-02012', '2026-25'),
('INFO-02018', '2026-25', 'INFO-02012', '2026-25'),
('INFO-02018', '2026-25', 'INFO-02013', '2026-25'),
('INFO-02019', '2026-25', 'INFO-02013', '2026-25'),
('INFO-02021', '2026-25', 'INFO-02014', '2026-25'),
('INFO-02022', '2026-25', 'FING-02011', '2026-25'),
('INFO-02022', '2026-25', 'FING-02010', '2026-25'),
('INFO-02023', '2026-25', 'INFO-02016', '2026-25'),
('INFO-02025', '2026-25', 'INFO-02018', '2026-25'),
('INFO-02025', '2026-25', 'INFO-02019', '2026-25'),
('INFO-02026', '2026-25', 'INFO-02021', '2026-25'),
('INFO-02027', '2026-25', 'INFO-02022', '2026-25'),
('INFO-02028', '2026-25', 'INFO-02023', '2026-25')
ON CONFLICT (CodAsig, CodTerm, CodAsigPreq, CodTermPreq) DO NOTHING;
