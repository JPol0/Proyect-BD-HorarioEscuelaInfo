-- database/03-StoreProcedure.sql
-- Procedimiento almacenado para guardar (upsert) una materia en Plan_de_Estudio

CREATE OR REPLACE PROCEDURE upsert_materia(
    p_CodAsig VARCHAR(40),
    p_CodTerm VARCHAR(30),
    p_NombrePE VARCHAR(100),
    p_EsComunPE BOOLEAN,
    p_SemestrePE dom_semestre,
    p_HoraPractica dom_horas,
    p_HoraTeorica dom_horas,
    p_HoraLaboratorio dom_horas,
    p_ModalidadPE dom_modalidad,
    p_NroSeccionesPE dom_num_secciones
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO Plan_de_Estudio (
        CodAsig, 
        CodTerm, 
        NombrePE, 
        EsComunPE, 
        SemestrePE, 
        HoraPractica, 
        HoraTeorica, 
        HoraLaboratorio, 
        ModalidadPE, 
        NroSeccionesPE
    )
    VALUES (
        p_CodAsig, 
        p_CodTerm, 
        p_NombrePE, 
        p_EsComunPE, 
        p_SemestrePE, 
        p_HoraPractica, 
        p_HoraTeorica, 
        p_HoraLaboratorio, 
        p_ModalidadPE, 
        p_NroSeccionesPE
    )
    ON CONFLICT (CodTerm, CodAsig) 
    DO UPDATE SET 
        NombrePE = EXCLUDED.NombrePE,
        EsComunPE = EXCLUDED.EsComunPE,
        SemestrePE = EXCLUDED.SemestrePE,
        HoraPractica = EXCLUDED.HoraPractica,
        HoraTeorica = EXCLUDED.HoraTeorica,
        HoraLaboratorio = EXCLUDED.HoraLaboratorio,
        ModalidadPE = EXCLUDED.ModalidadPE,
        NroSeccionesPE = EXCLUDED.NroSeccionesPE;
END;
$$;

-- Revocar permisos de ejecución a todos los usuarios (PUBLIC) por defecto
REVOKE EXECUTE ON PROCEDURE upsert_materia(VARCHAR, VARCHAR, VARCHAR, BOOLEAN, dom_semestre, dom_horas, dom_horas, dom_horas, dom_modalidad, dom_num_secciones) FROM PUBLIC;

-- Otorgar permiso de ejecución únicamente al rol de administrador
GRANT EXECUTE ON PROCEDURE upsert_materia(VARCHAR, VARCHAR, VARCHAR, BOOLEAN, dom_semestre, dom_horas, dom_horas, dom_horas, dom_modalidad, dom_num_secciones) TO rol_administrador;


-- Procedimiento almacenado para guardar (upsert) una alerta/warning
CREATE OR REPLACE PROCEDURE upsert_warning(
    p_CodWarning INT,
    p_CodTerm VARCHAR(30),
    p_FechaW TIMESTAMP,
    p_EstadoW dom_estado_warning,
    p_DescripcionW VARCHAR(250),
    p_ComentarioW VARCHAR(250)
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- 1. Si no viene un código de advertencia, asumimos que es un registro NUEVO
    IF p_CodWarning IS NULL THEN
        INSERT INTO Warnings (
            CodTerm,
            FechaW,
            EstadoW,
            DescripcionW,
            ComentarioW
        )
        VALUES (
            p_CodTerm,
            COALESCE(p_FechaW, NOW()), -- Si p_FechaW es NULL, usa la fecha/hora actual
            p_EstadoW,
            p_DescripcionW,
            p_ComentarioW
        );
        
    -- 2. Si el código SÍ viene, significa que el registro YA EXISTE y lo actualizamos
    ELSE
        UPDATE Warnings 
        SET 
            FechaW = COALESCE(p_FechaW, FechaW), -- Mantiene la fecha original si viene NULL
            EstadoW = p_EstadoW,
            DescripcionW = p_DescripcionW,
            ComentarioW = p_ComentarioW
        WHERE CodTerm = p_CodTerm AND CodWarning = p_CodWarning; -- Tu Clave Primaria compuesta
    END IF;
END;
$$;

-- Revocar permisos de ejecución de upsert_warning a PUBLIC
REVOKE EXECUTE ON PROCEDURE upsert_warning(INT, VARCHAR, TIMESTAMP, dom_estado_warning, VARCHAR, VARCHAR) FROM PUBLIC;

-- Conceder permisos de ejecución únicamente a rol_administrador
GRANT EXECUTE ON PROCEDURE upsert_warning(INT, VARCHAR, TIMESTAMP, dom_estado_warning, VARCHAR, VARCHAR) TO rol_administrador;

