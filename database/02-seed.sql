INSERT INTO usuarios (nombre, correo) VALUES
('Luis Gordillo', 'gordillo@correo.com'),
('Ignacio Camburin', 'cambur@correo.com'),
('KinJon Cora', 'kinjon@correo.com')
ON CONFLICT (correo) DO NOTHING;