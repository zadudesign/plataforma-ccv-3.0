-- ============================================================================
-- PLATAFORMA CCV 3.0 — FIX DEFINITIVO: TIPOS DE FECHA Y HORAS EN CRONOGRAMA
-- Resuelve: column "fecha_vencimiento" is of type date but expression is of type text
-- ============================================================================

-- 1. Asegurar columnas de fecha, fase y hora en las tablas
ALTER TABLE public.cursos
ADD COLUMN IF NOT EXISTS fecha_inicio DATE NULL,
ADD COLUMN IF NOT EXISTS duracion_dias INT NULL DEFAULT 60,
ADD COLUMN IF NOT EXISTS fecha_fin_estimada DATE NULL;

ALTER TABLE public.plantilla_tareas_curso
ADD COLUMN IF NOT EXISTS fase INT NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS nombre_fase TEXT NULL DEFAULT 'Fase 1: Estructuración Curricular';

ALTER TABLE public.tareas
ADD COLUMN IF NOT EXISTS fase INT NULL,
ADD COLUMN IF NOT EXISTS nombre_fase TEXT NULL,
ADD COLUMN IF NOT EXISTS hora_vencimiento TEXT NULL;

-- 2. Funciones de ayuda para días hábiles (DATE, TIMESTAMP y TIMESTAMPTZ)
CREATE OR REPLACE FUNCTION public.ajustar_a_dia_habil(p_fecha DATE)
RETURNS DATE
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    v_dow INT;
BEGIN
    v_dow := EXTRACT(DOW FROM p_fecha);
    IF v_dow = 6 THEN
        RETURN p_fecha - 1; -- Sábado -> Viernes
    ELSIF v_dow = 0 THEN
        RETURN p_fecha - 2; -- Domingo -> Viernes
    END IF;
    RETURN p_fecha;
END;
$$;

CREATE OR REPLACE FUNCTION public.ajustar_a_dia_habil(p_fecha TIMESTAMP WITHOUT TIME ZONE)
RETURNS DATE
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    RETURN public.ajustar_a_dia_habil(p_fecha::DATE);
END;
$$;

CREATE OR REPLACE FUNCTION public.ajustar_a_dia_habil(p_fecha TIMESTAMPTZ)
RETURNS DATE
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    RETURN public.ajustar_a_dia_habil(p_fecha::DATE);
END;
$$;

-- 3. Eliminar versión previa de 1 parámetro para evitar ambigüedad de funciones
DROP FUNCTION IF EXISTS public.inicializar_tareas_curso(UUID);

-- 4. Función RPC corregida: inicializar_tareas_curso
CREATE OR REPLACE FUNCTION public.inicializar_tareas_curso(
    p_curso_id UUID,
    p_fecha_inicio DATE DEFAULT CURRENT_DATE,
    p_duracion_dias INT DEFAULT 60
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_curso RECORD;
    v_num_unidades INT;
    v_total_existentes INT;
    v_pt RECORD;
    v_tarea_id UUID;
    v_responsable_id UUID;
    v_rol_destino TEXT;
    
    -- Mapas de IDs
    v_map_general JSONB := '{}'::jsonb;
    v_map_unit JSONB := '{}'::jsonb;
    v_map_dias JSONB := '{}'::jsonb;
    
    -- Variables de cronograma
    v_total_etapas INT := 0;
    v_etapa_idx INT := 0;
    v_dias_calc INT;
    v_fecha_limite DATE;
    v_fecha_cierre_final DATE;
    v_fase_rec RECORD;
    u INT;
    v_dep RECORD;
    v_dep_pt RECORD;
    v_deps_nuevas UUID[];
    v_bloqueo_inicial TEXT;
    v_instancia_tarea_id UUID;
BEGIN
    -- Validar existencia del curso
    SELECT * INTO v_curso FROM public.cursos WHERE id = p_curso_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'El curso especificado no existe.');
    END IF;

    v_num_unidades := COALESCE(v_curso.numero_unidades, 1);
    IF v_num_unidades < 1 THEN v_num_unidades := 1; END IF;

    -- Validar asignaciones obligatorias
    IF v_curso.docente_id IS NULL OR v_curso.evaluador_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false, 
            'message', 'Para cargar la plantilla, el curso debe tener Docente y Par Evaluador asignados.'
        );
    END IF;

    -- Validar que no tenga tareas previas
    SELECT COUNT(*) INTO v_total_existentes 
    FROM public.tareas 
    WHERE curso_id = p_curso_id AND plantilla_origen_id IS NOT NULL;

    IF v_total_existentes > 0 THEN
        RETURN jsonb_build_object('success', false, 'message', 'El curso ya tiene tareas cargadas.');
    END IF;

    -- Contar etapas para distribución del tiempo
    FOR v_fase_rec IN 
        SELECT DISTINCT fase, aplica_por_unidad 
        FROM public.plantilla_tareas_curso 
        WHERE activa = true 
        ORDER BY fase ASC 
    LOOP
        IF v_fase_rec.aplica_por_unidad IS NOT TRUE THEN
            v_total_etapas := v_total_etapas + 1;
        ELSE
            v_total_etapas := v_total_etapas + v_num_unidades;
        END IF;
    END LOOP;

    IF v_total_etapas = 0 THEN
        v_total_etapas := 1;
    END IF;

    -- Mapear días acumulados por fase y unidad
    FOR v_fase_rec IN 
        SELECT DISTINCT fase, aplica_por_unidad 
        FROM public.plantilla_tareas_curso 
        WHERE activa = true 
        ORDER BY fase ASC 
    LOOP
        IF v_fase_rec.aplica_por_unidad IS NOT TRUE THEN
            v_etapa_idx := v_etapa_idx + 1;
            v_dias_calc := ROUND((v_etapa_idx::numeric / v_total_etapas::numeric) * p_duracion_dias);
            v_map_dias := jsonb_set(v_map_dias, ARRAY[v_fase_rec.fase::text], to_jsonb(v_dias_calc));
        ELSE
            FOR u IN 1..v_num_unidades LOOP
                v_etapa_idx := v_etapa_idx + 1;
                v_dias_calc := ROUND((v_etapa_idx::numeric / v_total_etapas::numeric) * p_duracion_dias);
                v_map_dias := jsonb_set(v_map_dias, ARRAY[v_fase_rec.fase::text || '_' || u::text], to_jsonb(v_dias_calc));
            END LOOP;
        END IF;
    END LOOP;

    -- Actualizar fechas maestras del curso
    v_fecha_cierre_final := public.ajustar_a_dia_habil((p_fecha_inicio + (p_duracion_dias || ' days')::interval)::date);
    UPDATE public.cursos
    SET fecha_inicio = p_fecha_inicio,
        duracion_dias = p_duracion_dias,
        fecha_fin_estimada = v_fecha_cierre_final
    WHERE id = p_curso_id;

    -- Insertar tareas de la plantilla
    FOR v_pt IN 
        SELECT * FROM public.plantilla_tareas_curso 
        WHERE activa = true 
        ORDER BY orden ASC 
    LOOP
        -- Asignación de rol
        IF v_pt.tipo_responsable = 'DOCENTE' THEN
            v_responsable_id := v_curso.docente_id;
            v_rol_destino := 'Docente';
        ELSIF v_pt.tipo_responsable = 'PAR_EVALUADOR' THEN
            v_responsable_id := v_curso.evaluador_id;
            v_rol_destino := 'Par Evaluador';
        ELSIF v_pt.tipo_responsable = 'COORDINADOR' THEN
            SELECT pr.coordinador_id INTO v_responsable_id
            FROM public.programas pr WHERE pr.id = v_curso.programa_id;
            v_rol_destino := 'Coordinador de Programa';
        ELSIF v_pt.tipo_responsable = 'DECANO' THEN
            SELECT f.decano_id INTO v_responsable_id
            FROM public.programas pr JOIN public.facultades f ON f.id = pr.facultad_id
            WHERE pr.id = v_curso.programa_id;
            v_rol_destino := 'Decano de Facultad';
        ELSIF v_pt.tipo_responsable = 'CMU_FIJO' THEN
            v_responsable_id := v_pt.cmu_usuario_fijo_id;
            v_rol_destino := 'CMU / Producción';
        ELSE
            v_responsable_id := NULL;
            v_rol_destino := 'General';
        END IF;

        -- CASO A: Tarea transversal
        IF v_pt.aplica_por_unidad IS NOT TRUE THEN
            v_dias_calc := COALESCE((v_map_dias->>v_pt.fase::text)::int, p_duracion_dias);
            v_fecha_limite := public.ajustar_a_dia_habil((p_fecha_inicio + (v_dias_calc || ' days')::interval)::date);

            INSERT INTO public.tareas (
                titulo, descripcion, curso_id, responsable_id, rol_destino,
                orden_tarea, estado, estado_bloqueo, tipo_tarea, tiempo_estimado,
                plantilla_origen_id, dependencias_operativas, numero_unidad,
                fase, nombre_fase, fecha_vencimiento, hora_vencimiento
            ) VALUES (
                v_pt.titulo, COALESCE(v_pt.descripcion, ''), p_curso_id, v_responsable_id, v_rol_destino,
                v_pt.orden, 'Pendiente', 'BLOQUEADA', 'Curso Virtual',
                ROUND((COALESCE(v_pt.tiempo_estimado, 0)::numeric / 60.0), 2),
                v_pt.id, '{}', NULL,
                v_pt.fase, v_pt.nombre_fase, v_fecha_limite, '18:00'
            ) RETURNING id INTO v_tarea_id;

            v_map_general := jsonb_set(v_map_general, ARRAY[v_pt.id::text], to_jsonb(v_tarea_id::text));

        -- CASO B: Tarea por unidad
        ELSE
            FOR u IN 1..v_num_unidades LOOP
                v_dias_calc := COALESCE((v_map_dias->>(v_pt.fase::text || '_' || u::text))::int, p_duracion_dias);
                v_fecha_limite := public.ajustar_a_dia_habil((p_fecha_inicio + (v_dias_calc || ' days')::interval)::date);

                INSERT INTO public.tareas (
                    titulo, descripcion, curso_id, responsable_id, rol_destino,
                    orden_tarea, estado, estado_bloqueo, tipo_tarea, tiempo_estimado,
                    plantilla_origen_id, dependencias_operativas, numero_unidad,
                    fase, nombre_fase, fecha_vencimiento, hora_vencimiento
                ) VALUES (
                    '[Unidad ' || u || '] ' || v_pt.titulo,
                    COALESCE(v_pt.descripcion, '') || ' (Unidad ' || u || ')',
                    p_curso_id, v_responsable_id, v_rol_destino,
                    v_pt.orden, 'Pendiente', 'BLOQUEADA', 'Curso Virtual',
                    ROUND((COALESCE(v_pt.tiempo_estimado, 0)::numeric / 60.0), 2),
                    v_pt.id, '{}', u,
                    v_pt.fase, v_pt.nombre_fase, v_fecha_limite, '18:00'
                ) RETURNING id INTO v_tarea_id;

                v_map_unit := jsonb_set(v_map_unit, ARRAY[v_pt.id::text || '_' || u::text], to_jsonb(v_tarea_id::text));
            END LOOP;
        END IF;
    END LOOP;

    -- Resolución de dependencias operativas y desbloqueo
    FOR v_pt IN SELECT * FROM public.plantilla_tareas_curso WHERE activa = true LOOP
        IF v_pt.aplica_por_unidad IS NOT TRUE THEN
            v_instancia_tarea_id := (v_map_general->>v_pt.id::text)::uuid;
            v_deps_nuevas := '{}';

            FOR v_dep IN SELECT depende_de_id FROM public.plantilla_tareas_dependencias WHERE tarea_plantilla_id = v_pt.id LOOP
                SELECT * INTO v_dep_pt FROM public.plantilla_tareas_curso WHERE id = v_dep.depende_de_id;
                IF v_dep_pt.aplica_por_unidad IS NOT TRUE THEN
                    v_deps_nuevas := array_append(v_deps_nuevas, (v_map_general->>v_dep_pt.id::text)::uuid);
                ELSE
                    FOR u IN 1..v_num_unidades LOOP
                        v_deps_nuevas := array_append(v_deps_nuevas, (v_map_unit->>(v_dep_pt.id::text || '_' || u::text))::uuid);
                    END LOOP;
                END IF;
            END LOOP;

            v_bloqueo_inicial := CASE WHEN array_length(v_deps_nuevas, 1) IS NULL THEN 'DISPONIBLE' ELSE 'BLOQUEADA' END;
            UPDATE public.tareas 
            SET dependencias_operativas = v_deps_nuevas, estado_bloqueo = v_bloqueo_inicial 
            WHERE id = v_instancia_tarea_id;
        ELSE
            FOR u IN 1..v_num_unidades LOOP
                v_instancia_tarea_id := (v_map_unit->>(v_pt.id::text || '_' || u::text))::uuid;
                v_deps_nuevas := '{}';

                FOR v_dep IN SELECT depende_de_id FROM public.plantilla_tareas_dependencias WHERE tarea_plantilla_id = v_pt.id LOOP
                    SELECT * INTO v_dep_pt FROM public.plantilla_tareas_curso WHERE id = v_dep.depende_de_id;
                    IF v_dep_pt.aplica_por_unidad IS NOT TRUE THEN
                        v_deps_nuevas := array_append(v_deps_nuevas, (v_map_general->>v_dep_pt.id::text)::uuid);
                    ELSE
                        v_deps_nuevas := array_append(v_deps_nuevas, (v_map_unit->>(v_dep_pt.id::text || '_' || u::text))::uuid);
                    END IF;
                END LOOP;

                v_bloqueo_inicial := CASE WHEN array_length(v_deps_nuevas, 1) IS NULL THEN 'DISPONIBLE' ELSE 'BLOQUEADA' END;
                UPDATE public.tareas 
                SET dependencias_operativas = v_deps_nuevas, estado_bloqueo = v_bloqueo_inicial 
                WHERE id = v_instancia_tarea_id;
            END LOOP;
        END IF;
    END LOOP;

    RETURN jsonb_build_object(
        'success', true, 
        'message', 'Plantilla y cronograma de ' || p_duracion_dias || ' días cargados exitosamente con fechas hábiles.'
    );
END;
$$;

-- 5. Función RPC corregida: reajustar_cronograma_curso
CREATE OR REPLACE FUNCTION public.reajustar_cronograma_curso(
    p_curso_id UUID,
    p_fecha_inicio DATE,
    p_duracion_dias INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_curso RECORD;
    v_total_etapas INT := 0;
    v_etapa_idx INT := 0;
    v_dias_calc INT;
    v_nueva_fecha DATE;
    v_fecha_cierre_final DATE;
    v_map_dias JSONB := '{}'::jsonb;
    v_etapa_rec RECORD;
    v_t RECORD;
BEGIN
    SELECT * INTO v_curso FROM public.cursos WHERE id = p_curso_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'El curso especificado no existe.');
    END IF;

    -- Conteo de etapas
    FOR v_etapa_rec IN 
        SELECT DISTINCT COALESCE(fase, 1) as fase, numero_unidad 
        FROM public.tareas 
        WHERE curso_id = p_curso_id 
        ORDER BY fase ASC, numero_unidad ASC NULLS FIRST 
    LOOP
        v_total_etapas := v_total_etapas + 1;
    END LOOP;

    IF v_total_etapas = 0 THEN
        v_total_etapas := 1;
    END IF;

    -- Mapeo de días proporcionales
    FOR v_etapa_rec IN 
        SELECT DISTINCT COALESCE(fase, 1) as fase, numero_unidad 
        FROM public.tareas 
        WHERE curso_id = p_curso_id 
        ORDER BY fase ASC, numero_unidad ASC NULLS FIRST 
    LOOP
        v_etapa_idx := v_etapa_idx + 1;
        v_dias_calc := ROUND((v_etapa_idx::numeric / v_total_etapas::numeric) * p_duracion_dias);
        IF v_etapa_rec.numero_unidad IS NULL THEN
            v_map_dias := jsonb_set(v_map_dias, ARRAY[v_etapa_rec.fase::text], to_jsonb(v_dias_calc));
        ELSE
            v_map_dias := jsonb_set(v_map_dias, ARRAY[v_etapa_rec.fase::text || '_' || v_etapa_rec.numero_unidad::text], to_jsonb(v_dias_calc));
        END IF;
    END LOOP;

    -- Actualizar fechas maestras del curso
    v_fecha_cierre_final := public.ajustar_a_dia_habil((p_fecha_inicio + (p_duracion_dias || ' days')::interval)::date);
    UPDATE public.cursos
    SET fecha_inicio = p_fecha_inicio,
        duracion_dias = p_duracion_dias,
        fecha_fin_estimada = v_fecha_cierre_final
    WHERE id = p_curso_id;

    -- Actualizar tareas no completadas (pasando DATE sin ::text)
    FOR v_t IN SELECT * FROM public.tareas WHERE curso_id = p_curso_id AND estado != 'Completada' LOOP
        IF v_t.numero_unidad IS NULL THEN
            v_dias_calc := COALESCE((v_map_dias->>COALESCE(v_t.fase, 1)::text)::int, p_duracion_dias);
        ELSE
            v_dias_calc := COALESCE((v_map_dias->>(COALESCE(v_t.fase, 1)::text || '_' || v_t.numero_unidad::text))::int, p_duracion_dias);
        END IF;

        v_nueva_fecha := public.ajustar_a_dia_habil((p_fecha_inicio + (v_dias_calc || ' days')::interval)::date);

        UPDATE public.tareas
        SET fecha_vencimiento = v_nueva_fecha
        WHERE id = v_t.id;
    END LOOP;

    RETURN jsonb_build_object('success', true, 'message', 'Cronograma reajustado exitosamente con fechas hábiles.');
END;
$$;
