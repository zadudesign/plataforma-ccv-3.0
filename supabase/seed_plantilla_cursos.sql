-- ============================================================================
-- PLATAFORMA CCV 3.0 — SEMILLA (SEED) PARA PLANTILLA DE CURSOS VIRTUALES
-- Tareas representativas interconectadas para validar el flujo secuencial
-- ============================================================================

DO $$
DECLARE
    v_t01 UUID := '11111111-1111-4111-a111-111111111101';
    v_t02 UUID := '11111111-1111-4111-a111-111111111102';
    v_t03 UUID := '11111111-1111-4111-a111-111111111103';
    v_t04 UUID := '11111111-1111-4111-a111-111111111104';
    v_t05 UUID := '11111111-1111-4111-a111-111111111105';
    v_t06 UUID := '11111111-1111-4111-a111-111111111106';
    v_t07 UUID := '11111111-1111-4111-a111-111111111107';
    v_t08 UUID := '11111111-1111-4111-a111-111111111108';
BEGIN
    -- 1. Insertar Tareas Base
    INSERT INTO public.plantilla_tareas_curso (id, codigo, titulo, descripcion, orden, tipo_responsable, tipo_tarea, tiempo_estimado, activa)
    VALUES
        (v_t01, 'T01', 'Entrega de Microcurrículo y Plan de Asignatura', 'El docente carga la propuesta curricular, resultados de aprendizaje y metodología del curso.', 1, 'DOCENTE', 'PRODUCCION', 120, true),
        (v_t02, 'T02', 'Revisión Pedagógica y Didáctica', 'El par evaluador verifica la coherencia curricular, rúbricas de evaluación y diseño instruccional.', 2, 'PAR_EVALUADOR', 'REVISION', 90, true),
        (v_t03, 'T03', 'Ajustes Pedagógicos y Aprobación Curricular', 'El docente realiza las correcciones sugeridas por el par evaluador y valida la versión definitiva.', 3, 'DOCENTE', 'PRODUCCION', 60, true),
        (v_t04, 'T04', 'Entrega de Guiones y Contenidos de Módulos', 'Elaboración de contenidos textuales, lecturas, guías y especificaciones de recursos multimedia.', 4, 'DOCENTE', 'PRODUCCION', 180, true),
        (v_t05, 'T05', 'Diseño Gráfico y Maquetación de Materiales', 'El equipo CMU diseña infografías, banners de unidades, plantillas interactivas y presentaciones.', 5, 'CMU_FIJO', 'PRODUCCION', 240, true),
        (v_t06, 'T06', 'Producción Audiovisual y Cápsulas Educativas', 'Grabación, edición y postproducción de videos introductorios y cápsulas temáticas del curso.', 6, 'CMU_FIJO', 'PRODUCCION', 300, true),
        (v_t07, 'T07', 'Montaje y Parametrización en LMS (Moodle)', 'Configuración de secciones, cuestionarios, foros, tareas y recursos didácticos en el aula virtual.', 7, 'CMU_FIJO', 'SOPORTE', 180, true),
        (v_t08, 'T08', 'Certificación de Calidad y Validación Final', 'El par evaluador y CCV realizan la auditoría final del curso previa a la apertura a estudiantes.', 8, 'PAR_EVALUADOR', 'REVISION', 120, true)
    ON CONFLICT (codigo) DO UPDATE
    SET titulo = EXCLUDED.titulo,
        descripcion = EXCLUDED.descripcion,
        orden = EXCLUDED.orden,
        tipo_responsable = EXCLUDED.tipo_responsable,
        tipo_tarea = EXCLUDED.tipo_tarea,
        tiempo_estimado = EXCLUDED.tiempo_estimado,
        activa = EXCLUDED.activa;

    -- 2. Insertar Dependencias
    -- T02 depende de T01
    INSERT INTO public.plantilla_tareas_dependencias (tarea_plantilla_id, depende_de_id)
    VALUES (v_t02, v_t01)
    ON CONFLICT (tarea_plantilla_id, depende_de_id) DO NOTHING;

    -- T03 depende de T02
    INSERT INTO public.plantilla_tareas_dependencias (tarea_plantilla_id, depende_de_id)
    VALUES (v_t03, v_t02)
    ON CONFLICT (tarea_plantilla_id, depende_de_id) DO NOTHING;

    -- T04 depende de T03
    INSERT INTO public.plantilla_tareas_dependencias (tarea_plantilla_id, depende_de_id)
    VALUES (v_t04, v_t03)
    ON CONFLICT (tarea_plantilla_id, depende_de_id) DO NOTHING;

    -- T05 y T06 dependen de T04
    INSERT INTO public.plantilla_tareas_dependencias (tarea_plantilla_id, depende_de_id)
    VALUES 
        (v_t05, v_t04),
        (v_t06, v_t04)
    ON CONFLICT (tarea_plantilla_id, depende_de_id) DO NOTHING;

    -- T07 depende tanto de T05 como de T06
    INSERT INTO public.plantilla_tareas_dependencias (tarea_plantilla_id, depende_de_id)
    VALUES 
        (v_t07, v_t05),
        (v_t07, v_t06)
    ON CONFLICT (tarea_plantilla_id, depende_de_id) DO NOTHING;

    -- T08 depende de T07
    INSERT INTO public.plantilla_tareas_dependencias (tarea_plantilla_id, depende_de_id)
    VALUES (v_t08, v_t07)
    ON CONFLICT (tarea_plantilla_id, depende_de_id) DO NOTHING;

    RAISE NOTICE 'Semilla de Plantilla de Tareas para Cursos insertada exitosamente.';
END $$;
