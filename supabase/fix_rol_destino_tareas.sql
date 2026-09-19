-- ============================================================================
-- PLATAFORMA CCV 3.0 — MIGRACIÓN: CONVERSIÓN DE ROL_DESTINO A TEXT
-- Soluciona: column "rol_destino" is of type uuid but expression is of type text
-- ============================================================================

-- 1. Eliminar restricciones de clave foránea si existen sobre rol_destino
ALTER TABLE public.tareas DROP CONSTRAINT IF EXISTS tareas_rol_destino_fkey;
ALTER TABLE public.tareas DROP CONSTRAINT IF EXISTS fk_tareas_roles;

-- 2. Convertir la columna rol_destino a tipo TEXT (conservando valores existentes)
ALTER TABLE public.tareas 
  ALTER COLUMN rol_destino TYPE TEXT USING rol_destino::text;

-- 3. Si existe la columna rol_destino_secundario, asegurar también su conversión a TEXT
DO $$ 
BEGIN 
    ALTER TABLE public.tareas DROP CONSTRAINT IF EXISTS tareas_rol_destino_secundario_fkey;
    ALTER TABLE public.tareas ALTER COLUMN rol_destino_secundario TYPE TEXT USING rol_destino_secundario::text;
EXCEPTION WHEN OTHERS THEN 
    NULL;
END $$;

-- 4. Re-compilar la función RPC de instanciación de cursos
CREATE OR REPLACE FUNCTION public.inicializar_tareas_curso(p_curso_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_curso RECORD;
    v_total_existentes INT;
    v_pt RECORD;
    v_tarea_id UUID;
    v_map_ids JSONB := '{}'::jsonb;
    v_deps_nuevas UUID[];
    v_bloqueo_inicial TEXT;
    v_responsable_id UUID;
    v_rol_destino TEXT;
BEGIN
    -- 1. Validar existencia del curso
    SELECT * INTO v_curso FROM public.cursos WHERE id = p_curso_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'El curso especificado no existe.');
    END IF;

    -- 2. Validación estricta: docente y par evaluador asignados
    IF v_curso.docente_id IS NULL OR v_curso.evaluador_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false, 
            'message', 'Para cargar la plantilla, el curso debe tener docente y par evaluador asignados.'
        );
    END IF;

    -- 3. Validar que no tenga tareas previas generadas desde la plantilla
    SELECT COUNT(*) INTO v_total_existentes 
    FROM public.tareas 
    WHERE curso_id = p_curso_id AND plantilla_origen_id IS NOT NULL;

    IF v_total_existentes > 0 THEN
        RETURN jsonb_build_object('success', false, 'message', 'El curso ya tiene tareas cargadas desde la plantilla predeterminada.');
    END IF;

    -- 4. Iterar e insertar tareas activas de la plantilla
    FOR v_pt IN 
        SELECT * FROM public.plantilla_tareas_curso 
        WHERE activa = true 
        ORDER BY orden ASC 
    LOOP
        -- Asignar responsable y rol según el tipo
        IF v_pt.tipo_responsable = 'DOCENTE' THEN
            v_responsable_id := v_curso.docente_id;
            v_rol_destino := 'Docente';
        ELSIF v_pt.tipo_responsable = 'PAR_EVALUADOR' THEN
            v_responsable_id := v_curso.evaluador_id;
            v_rol_destino := 'Par Evaluador';
        ELSIF v_pt.tipo_responsable = 'COORDINADOR' THEN
            -- Obtener el coordinador del programa del curso
            SELECT pr.coordinador_id INTO v_responsable_id
            FROM public.programas pr
            WHERE pr.id = v_curso.programa_id;
            v_rol_destino := 'Coordinador de Programa';
        ELSIF v_pt.tipo_responsable = 'DECANO' THEN
            -- Obtener el decano de la facultad del curso
            SELECT f.decano_id INTO v_responsable_id
            FROM public.programas pr
            JOIN public.facultades f ON f.id = pr.facultad_id
            WHERE pr.id = v_curso.programa_id;
            v_rol_destino := 'Decano de Facultad';
        ELSIF v_pt.tipo_responsable = 'CMU_FIJO' THEN
            v_responsable_id := v_pt.cmu_usuario_fijo_id;
            v_rol_destino := 'CMU / Producción';
        ELSE
            v_responsable_id := NULL;
            v_rol_destino := 'General';
        END IF;

        INSERT INTO public.tareas (
            titulo,
            descripcion,
            curso_id,
            responsable_id,
            rol_destino,
            orden_tarea,
            estado,
            estado_bloqueo,
            tipo_tarea,
            tiempo_estimado,
            plantilla_origen_id,
            dependencias_operativas
        ) VALUES (
            v_pt.titulo,
            v_pt.descripcion,
            p_curso_id,
            v_responsable_id,
            v_rol_destino,
            v_pt.orden,
            'Pendiente',
            'BLOQUEADA',
            'Curso Virtual',
            ROUND((v_pt.tiempo_estimado::numeric / 60.0), 2),
            v_pt.id,
            '{}'
        ) RETURNING id INTO v_tarea_id;

        v_map_ids := jsonb_set(v_map_ids, ARRAY[v_pt.id::text], to_jsonb(v_tarea_id::text));
    END LOOP;

    -- 5. Mapear dependencias operativas y calcular estado_bloqueo inicial
    FOR v_pt IN SELECT * FROM public.plantilla_tareas_curso WHERE activa = true LOOP
        v_tarea_id := (v_map_ids->>v_pt.id::text)::uuid;

        SELECT COALESCE(array_agg((v_map_ids->>dep.depende_de_id::text)::uuid), '{}')
        INTO v_deps_nuevas
        FROM public.plantilla_tareas_dependencias dep
        WHERE dep.tarea_plantilla_id = v_pt.id
          AND v_map_ids ? dep.depende_de_id::text;

        IF array_length(v_deps_nuevas, 1) IS NULL OR array_length(v_deps_nuevas, 1) = 0 THEN
            v_bloqueo_inicial := 'DISPONIBLE';
        ELSE
            v_bloqueo_inicial := 'BLOQUEADA';
        END IF;

        UPDATE public.tareas
        SET dependencias_operativas = v_deps_nuevas,
            estado_bloqueo = v_bloqueo_inicial
        WHERE id = v_tarea_id;
    END LOOP;

    RETURN jsonb_build_object(
        'success', true, 
        'message', 'Secuencia de tareas instanciada exitosamente en el curso.',
        'total', (SELECT count(*) FROM public.tareas WHERE curso_id = p_curso_id AND plantilla_origen_id IS NOT NULL)
    );
END;
$$;
