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
