INSERT INTO usuarios (nombre, correo) VALUES
('Luis Gordillo', 'gordillo@correo.com'),
('Ignacio Camburin', 'cambur@correo.com'),
('KinJon Cora', 'kinjon@correo.com')
ON CONFLICT (correo) DO NOTHING;

INSERT INTO materias (cod_materia, nombre, nro_secciones, horas_teo, horas_lab, semestre, modalidad, es_comun)
VALUES 
('EDO-1121', 'Calculo I', 3, 4, 0, 1, 'PRE', FALSE),
('PYE-2013', 'Programacion orientada a objetos', 1, 4, 2, 3, 'PRE', FALSE),
('CSU-1012', 'Castellano', 3, 3, 0, 1, 'PRE', TRUE),
('EDA-2053', 'Estructura de Datos', 1, 3, 2, 3, 'PRE', FALSE);