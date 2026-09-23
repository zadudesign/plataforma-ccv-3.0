-- ============================================================================
-- PLATAFORMA CCV 3.0 — CRONOGRAMA AUTOMÁTICO DE CURSOS POR FASES (30 - 120 DÍAS)
-- Omisión de fines de semana y cálculo de hitos de entrega
-- ============================================================================

-- 1. Campos de cronograma en la tabla de cursos
ALTER TABLE public.cursos
ADD COLUMN IF NOT EXISTS fecha_inicio DATE NULL,
ADD COLUMN IF NOT EXISTS duracion_dias INT NULL DEFAULT 60,
ADD COLUMN IF NOT EXISTS fecha_fin_estimada DATE NULL;

-- 2. Enumeración y nombre de Fase en la plantilla de tareas maestras
ALTER TABLE public.plantilla_tareas_curso
ADD COLUMN IF NOT EXISTS fase INT NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS nombre_fase TEXT NULL DEFAULT 'Fase 1: Estructuración Curricular';

-- 3. Identificación de Fase en las tareas operativas de cursos
ALTER TABLE public.tareas
ADD COLUMN IF NOT EXISTS fase INT NULL,
ADD COLUMN IF NOT EXISTS nombre_fase TEXT NULL;

-- 4. Actualizar fases y nombres en las tareas base del catálogo si existen
UPDATE public.plantilla_tareas_curso
SET fase = 1, nombre_fase = 'Fase 1: Estructuración Curricular'
WHERE codigo IN ('T01', 'T02', 'T03') AND (fase IS NULL OR fase = 1);

UPDATE public.plantilla_tareas_curso
SET fase = 2, nombre_fase = 'Fase 2: Elaboración de Contenidos y Recursos', aplica_por_unidad = true
WHERE codigo IN ('T04', 'T05', 'T06');

UPDATE public.plantilla_tareas_curso
SET fase = 3, nombre_fase = 'Fase 3: Montaje en LMS y Certificación de Calidad'
WHERE codigo IN ('T07', 'T08');

-- 5. Función helper para ajustar fecha si cae en fin de semana (Sábado/Domingo -> Viernes hábil)
CREATE OR REPLACE FUNCTION public.ajustar_a_dia_habil(p_fecha DATE)
RETURNS DATE
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    v_dow INT;
BEGIN
    -- 0 = Domingo, 6 = Sábado
    v_dow := EXTRACT(DOW FROM p_fecha);
    IF v_dow = 6 THEN
        RETURN p_fecha - INTERVAL '1 day'; -- Sábado -> Viernes hábil
    ELSIF v_dow = 0 THEN
        RETURN p_fecha - INTERVAL '2 days'; -- Domingo -> Viernes hábil
    END IF;
    RETURN p_fecha;
END;
$$;

-- 6. Actualización de RPC: inicializar_tareas_curso con cálculo de cronograma
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
    
    -- Variables de cálculo de cronograma
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
    -- 1. Validar existencia del curso
    SELECT * INTO v_curso FROM public.cursos WHERE id = p_curso_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'El curso especificado no existe.');
    END IF;

    v_num_unidades := COALESCE(v_curso.numero_unidades, 1);
    IF v_num_unidades < 1 THEN v_num_unidades := 1; END IF;

    -- 2. Validar que tenga docente y par evaluador asignados
    IF v_curso.docente_id IS NULL OR v_curso.evaluador_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false, 
            'message', 'Para cargar la plantilla, el curso debe tener Docente y Par Evaluador asignados.'
        );
    END IF;

    -- 3. Validar que no tenga tareas previas generadas desde la plantilla
    SELECT COUNT(*) INTO v_total_existentes 
    FROM public.tareas 
    WHERE curso_id = p_curso_id AND plantilla_origen_id IS NOT NULL;

    IF v_total_existentes > 0 THEN
        RETURN jsonb_build_object(
            'success', false, 
            'message', 'El curso ya tiene tareas cargadas desde la plantilla predeterminada.'
        );
    END IF;

    -- 4. Calcular el total de etapas cronológicas distintas
    -- Fases generales = 1 etapa c/u; Fases por unidad = v_num_unidades etapas c/u
    SELECT COALESCE(SUM(CASE WHEN es_por_unidad THEN v_num_unidades ELSE 1 END), 1)
    INTO v_total_etapas
    FROM (
        SELECT fase, bool_or(aplica_por_unidad) AS es_por_unidad
        FROM public.plantilla_tareas_curso
        WHERE activa = true
        GROUP BY fase
    ) sub;

    IF v_total_etapas < 1 THEN v_total_etapas := 1; END IF;

    -- Construir mapa de días acumulados para cada fase y unidad
    v_etapa_idx := 0;
    FOR v_fase_rec IN 
        SELECT fase, bool_or(aplica_por_unidad) AS es_por_unidad 
        FROM public.plantilla_tareas_curso 
        WHERE activa = true 
        GROUP BY fase 
        ORDER BY fase ASC 
    LOOP
        IF v_fase_rec.es_por_unidad IS NOT TRUE THEN
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

    -- 5. Actualizar fechas maestras del curso
    v_fecha_cierre_final := public.ajustar_a_dia_habil(p_fecha_inicio + (p_duracion_dias || ' days')::interval);
    UPDATE public.cursos
    SET fecha_inicio = p_fecha_inicio,
        duracion_dias = p_duracion_dias,
        fecha_fin_estimada = v_fecha_cierre_final
    WHERE id = p_curso_id;

    -- 6. Insertar tareas asignando fecha_vencimiento calculada omitiendo fines de semana
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
            v_fecha_limite := public.ajustar_a_dia_habil(p_fecha_inicio + (v_dias_calc || ' days')::interval);

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
                v_pt.fase, v_pt.nombre_fase, v_fecha_limite::text, '18:00'
            ) RETURNING id INTO v_tarea_id;

            v_map_general := jsonb_set(v_map_general, ARRAY[v_pt.id::text], to_jsonb(v_tarea_id::text));

        -- CASO B: Tarea por unidad
        ELSE
            FOR u IN 1..v_num_unidades LOOP
                v_dias_calc := COALESCE((v_map_dias->>(v_pt.fase::text || '_' || u::text))::int, p_duracion_dias);
                v_fecha_limite := public.ajustar_a_dia_habil(p_fecha_inicio + (v_dias_calc || ' days')::interval);

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
                    v_pt.fase, v_pt.nombre_fase, v_fecha_limite::text, '18:00'
                ) RETURNING id INTO v_tarea_id;

                v_map_unit := jsonb_set(v_map_unit, ARRAY[v_pt.id::text || '_' || u::text], to_jsonb(v_tarea_id::text));
            END LOOP;
        END IF;
    END LOOP;

    -- 7. Resolución de dependencias y desbloqueo inicial
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

-- 7. Función RPC para reajustar o prorrogar el cronograma de un curso existente
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
    v_fecha_cierre_final DATE;
    v_t RECORD;
    v_etapa_rec RECORD;
    v_map_dias JSONB := '{}'::jsonb;
    v_nueva_fecha DATE;
BEGIN
    SELECT * INTO v_curso FROM public.cursos WHERE id = p_curso_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'El curso no existe.');
    END IF;

    -- Calcular total de etapas cronológicas presentes en las tareas del curso
    SELECT COUNT(DISTINCT 
        CASE 
            WHEN numero_unidad IS NOT NULL THEN COALESCE(fase, 1)::text || '_' || numero_unidad::text
            ELSE COALESCE(fase, 1)::text
        END
    ) INTO v_total_etapas
    FROM public.tareas
    WHERE curso_id = p_curso_id;

    IF v_total_etapas < 1 THEN v_total_etapas := 1; END IF;

    -- Mapear días acumulados por etapa cronológica
    v_etapa_idx := 0;
    FOR v_etapa_rec IN 
        SELECT DISTINCT COALESCE(fase, 1) AS fase, numero_unidad
        FROM public.tareas
        WHERE curso_id = p_curso_id
        ORDER BY COALESCE(fase, 1) ASC, COALESCE(numero_unidad, 0) ASC
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
    v_fecha_cierre_final := public.ajustar_a_dia_habil(p_fecha_inicio + (p_duracion_dias || ' days')::interval);
    UPDATE public.cursos
    SET fecha_inicio = p_fecha_inicio,
        duracion_dias = p_duracion_dias,
        fecha_fin_estimada = v_fecha_cierre_final
    WHERE id = p_curso_id;

    -- Actualizar fechas de vencimiento de las tareas no completadas
    FOR v_t IN SELECT * FROM public.tareas WHERE curso_id = p_curso_id AND estado != 'Completada' LOOP
        IF v_t.numero_unidad IS NULL THEN
            v_dias_calc := COALESCE((v_map_dias->>COALESCE(v_t.fase, 1)::text)::int, p_duracion_dias);
        ELSE
            v_dias_calc := COALESCE((v_map_dias->>(COALESCE(v_t.fase, 1)::text || '_' || v_t.numero_unidad::text))::int, p_duracion_dias);
        END IF;

        v_nueva_fecha := public.ajustar_a_dia_habil(p_fecha_inicio + (v_dias_calc || ' days')::interval);

        UPDATE public.tareas
        SET fecha_vencimiento = v_nueva_fecha::text
        WHERE id = v_t.id;
    END LOOP;

    RETURN jsonb_build_object('success', true, 'message', 'Cronograma reajustado exitosamente con fechas hábiles.');
END;
$$;
