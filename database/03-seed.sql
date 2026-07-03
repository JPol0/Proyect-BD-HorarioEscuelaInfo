INSERT INTO usuarios (nombre, password, rol) VALUES
('Luis Gordillo', 'gordillo123', 'administrador'),
('Ignacio Camburin', 'cambur123', 'lector'),
('KinJon Cora', 'kinjon123', 'lector')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO Terms (CodTerm, DescripcionT, StatusT) VALUES
('1', 'Segundo Semestre 2026', 'A'),
('2', 'Primer Semestre 2026', 'D'),
('3', 'Segundo Semestre 2025', 'D'),
('4', 'Primer Semestre 2025', 'D'),
('5', 'Segundo Semestre 2024', 'D')
ON CONFLICT (CodTerm) DO NOTHING;

INSERT INTO Plan_de_Estudio (CodAsig, CodTerm, NroSeccionesPE) VALUES
('EDO-1121', '1', 3),
('PYE-2013', '1', 1),
('CSU-1012', '1', 3),
('EDA-2053', '1', 1)
ON CONFLICT (CodAsig, CodTerm) DO NOTHING;

INSERT INTO Materias (CodAsig, NombrePE, HoraPractica, HoraTeorica, HoraLaboratorio, SemestrePE, EsComunPE, ModalidadPE) VALUES
('EDO-1121', 'Calculo I', 0, 4, 0, 1, FALSE, 'PRE'),
('PYE-2013', 'Programacion orientada a objetos', 0, 4, 2, 3, FALSE, 'PRE'),
('CSU-1012', 'Castellano', 0, 3, 0, 1, TRUE, 'PRE'),
('EDA-2053', 'Estructura de Datos', 0, 3, 2, 3, FALSE, 'PRE')
ON CONFLICT (CodAsig) DO NOTHING;