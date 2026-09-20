-- ============================================================================
-- PLATAFORMA CCV 3.0 — REGLAS Y VALIDACIONES ACADÉMICAS ESTRICTAS
-- Reglas de Integridad:
-- 1. Toda Facultad requiere obligatoriamente un Decano (decano_id).
-- 2. Todo Programa requiere obligatoriamente un Coordinador (coordinador_id).
-- 3. Todo Curso Virtual requiere obligatoriamente un Docente (docente_id) y un Par Evaluador (evaluador_id).
-- 4. El Docente y el Par Evaluador deben ser usuarios distintos.
-- ============================================================================

-- 1. FUNCIÓN TRIGGER PARA VALIDAR FACULTADES
CREATE OR REPLACE FUNCTION public.fn_validar_facultad_estricta()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.decano_id IS NULL THEN
        RAISE EXCEPTION 'Es obligatorio asignar un Decano para la Facultad (decano_id no puede ser nulo).';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validar_facultad_estricta ON public.facultades;
CREATE TRIGGER trg_validar_facultad_estricta
    BEFORE INSERT OR UPDATE ON public.facultades
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_validar_facultad_estricta();


-- 2. FUNCIÓN TRIGGER PARA VALIDAR PROGRAMAS
CREATE OR REPLACE FUNCTION public.fn_validar_programa_estricto()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.coordinador_id IS NULL THEN
        RAISE EXCEPTION 'Es obligatorio asignar un Coordinador para el Programa (coordinador_id no puede ser nulo).';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validar_programa_estricto ON public.programas;
CREATE TRIGGER trg_validar_programa_estricto
    BEFORE INSERT OR UPDATE ON public.programas
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_validar_programa_estricto();


-- 3. FUNCIÓN TRIGGER PARA VALIDAR CURSOS VIRTUALES
CREATE OR REPLACE FUNCTION public.fn_validar_curso_estricto()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.docente_id IS NULL THEN
        RAISE EXCEPTION 'Es obligatorio asignar un Docente responsable para el curso (docente_id no puede ser nulo).';
    END IF;

    IF NEW.evaluador_id IS NULL THEN
        RAISE EXCEPTION 'Es obligatorio asignar un Par Evaluador para el curso (evaluador_id no puede ser nulo).';
    END IF;

    IF NEW.docente_id = NEW.evaluador_id THEN
        RAISE EXCEPTION 'El Docente y el Par Evaluador deben ser personas distintas.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validar_curso_estricto ON public.cursos;
CREATE TRIGGER trg_validar_curso_estricto
    BEFORE INSERT OR UPDATE ON public.cursos
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_validar_curso_estricto();

-- Comentarios explicativos en el catálogo de PostgreSQL
COMMENT ON FUNCTION public.fn_validar_facultad_estricta() IS 'Garantiza que toda Facultad tenga un Decano asignado.';
COMMENT ON FUNCTION public.fn_validar_programa_estricto() IS 'Garantiza que todo Programa tenga un Coordinador asignado.';
COMMENT ON FUNCTION public.fn_validar_curso_estricto() IS 'Garantiza que todo Curso tenga Docente y Par Evaluador distintos y obligatorios.';
