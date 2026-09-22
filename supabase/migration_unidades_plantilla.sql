-- ============================================================================
-- PLATAFORMA CCV 3.0 — MIGRACIÓN: UNIDADES DINÁMICAS EN PLANTILLA Y CURSOS
-- ============================================================================

-- 1. Agregar columna numero_unidades a la tabla de cursos
ALTER TABLE public.cursos
ADD COLUMN IF NOT EXISTS numero_unidades INT NOT NULL DEFAULT 1 CHECK (numero_unidades >= 1);

-- 2. Parametrizar la plantilla maestra para tareas repetibles por unidad
ALTER TABLE public.plantilla_tareas_curso
ADD COLUMN IF NOT EXISTS aplica_por_unidad BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS seccion TEXT NOT NULL DEFAULT 'GENERAL';

-- 3. Identificar el número de unidad en la tabla operativa de tareas
ALTER TABLE public.tareas
ADD COLUMN IF NOT EXISTS numero_unidad INT NULL;

CREATE INDEX IF NOT EXISTS idx_tareas_curso_unidad ON public.tareas(curso_id, numero_unidad);

-- 4. Actualizar función RPC: inicializar_tareas_curso
-- Soporta instanciación de tareas generales (1x) y tareas por unidad (Nx)
-- con resolución de dependencias intra-unidad, paralelismo y bloqueo de cierre.
CREATE OR REPLACE FUNCTION public.inicializar_tareas_curso(p_curso_id UUID)
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
    
    -- Mapas de IDs para resolución de dependencias
    v_map_general JSONB := '{}'::jsonb;         -- plantilla_id -> tarea_id
    v_map_unit JSONB := '{}'::jsonb;            -- (plantilla_id || '_' || u) -> tarea_id
    
    -- Cursor para resolución de dependencias
    v_dep RECORD;
    v_dep_pt RECORD;
    v_deps_nuevas UUID[];
    v_bloqueo_inicial TEXT;
    u INT;
    v_instancia_tarea_id UUID;
BEGIN
    -- 1. Validar existencia del curso
    SELECT * INTO v_curso FROM public.cursos WHERE id = p_curso_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'El curso especificado no existe.');
    END IF;

    v_num_unidades := COALESCE(v_curso.numero_unidades, 1);
    IF v_num_unidades < 1 THEN
        v_num_unidades := 1;
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
        RETURN jsonb_build_object(
            'success', false, 
            'message', 'El curso ya tiene tareas cargadas desde la plantilla predeterminada.'
        );
    END IF;

    -- 4. Iterar e insertar tareas activas de la plantilla
    FOR v_pt IN 
        SELECT * FROM public.plantilla_tareas_curso 
        WHERE activa = true 
        ORDER BY orden ASC 
    LOOP
        -- Asignar responsable y rol según el tipo definido en la plantilla
        IF v_pt.tipo_responsable = 'DOCENTE' THEN
            v_responsable_id := v_curso.docente_id;
            v_rol_destino := 'Docente';
        ELSIF v_pt.tipo_responsable = 'PAR_EVALUADOR' THEN
            v_responsable_id := v_curso.evaluador_id;
            v_rol_destino := 'Par Evaluador';
        ELSIF v_pt.tipo_responsable = 'COORDINADOR' THEN
            SELECT pr.coordinador_id INTO v_responsable_id
            FROM public.programas pr
            WHERE pr.id = v_curso.programa_id;
            v_rol_destino := 'Coordinador de Programa';
        ELSIF v_pt.tipo_responsable = 'DECANO' THEN
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

        -- CASO A: Tarea transversal/general (se crea 1 vez)
        IF v_pt.aplica_por_unidad IS NOT TRUE THEN
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
                dependencias_operativas,
                numero_unidad
            ) VALUES (
                v_pt.titulo,
                COALESCE(v_pt.descripcion, ''),
                p_curso_id,
                v_responsable_id,
                v_rol_destino,
                v_pt.orden,
                'Pendiente',
                'BLOQUEADA',
                'Curso Virtual',
                ROUND((COALESCE(v_pt.tiempo_estimado, 0)::numeric / 60.0), 2),
                v_pt.id,
                '{}',
                NULL
            ) RETURNING id INTO v_tarea_id;

            v_map_general := jsonb_set(v_map_general, ARRAY[v_pt.id::text], to_jsonb(v_tarea_id::text));

        -- CASO B: Tarea por unidad (se multiplica N veces según v_num_unidades)
        ELSE
            FOR u IN 1..v_num_unidades LOOP
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
                    dependencias_operativas,
                    numero_unidad
                ) VALUES (
                    '[Unidad ' || u || '] ' || v_pt.titulo,
                    COALESCE(v_pt.descripcion, '') || ' (Correspondiente a la Unidad ' || u || ' del curso)',
                    p_curso_id,
                    v_responsable_id,
                    v_rol_destino,
                    v_pt.orden,
                    'Pendiente',
                    'BLOQUEADA',
                    'Curso Virtual',
                    ROUND((COALESCE(v_pt.tiempo_estimado, 0)::numeric / 60.0), 2),
                    v_pt.id,
                    '{}',
                    u
                ) RETURNING id INTO v_tarea_id;

                v_map_unit := jsonb_set(v_map_unit, ARRAY[v_pt.id::text || '_' || u::text], to_jsonb(v_tarea_id::text));
            END LOOP;
        END IF;

    END LOOP;

    -- 5. Mapear dependencias operativas y calcular estado_bloqueo inicial
    FOR v_pt IN SELECT * FROM public.plantilla_tareas_curso WHERE activa = true LOOP

        -- CASO 1: La tarea de plantilla era GENERAL
        IF v_pt.aplica_por_unidad IS NOT TRUE THEN
            v_instancia_tarea_id := (v_map_general->>v_pt.id::text)::uuid;
            v_deps_nuevas := '{}';

            -- Buscar todas las dependencias de v_pt
            FOR v_dep IN 
                SELECT depende_de_id 
                FROM public.plantilla_tareas_dependencias 
                WHERE tarea_plantilla_id = v_pt.id 
            LOOP
                SELECT * INTO v_dep_pt FROM public.plantilla_tareas_curso WHERE id = v_dep.depende_de_id;
                
                -- Si la predecesora es GENERAL -> Depende de su única instancia
                IF v_dep_pt.aplica_por_unidad IS NOT TRUE THEN
                    IF v_map_general ? v_dep.depende_de_id::text THEN
                        v_deps_nuevas := array_append(v_deps_nuevas, (v_map_general->>v_dep.depende_de_id::text)::uuid);
                    END IF;
                -- Si la predecesora es POR UNIDAD (ej. Cierre) -> Depende de TODAS las unidades de esa tarea
                ELSE
                    FOR u IN 1..v_num_unidades LOOP
                        IF v_map_unit ? (v_dep.depende_de_id::text || '_' || u::text) THEN
                            v_deps_nuevas := array_append(v_deps_nuevas, (v_map_unit->>(v_dep.depende_de_id::text || '_' || u::text))::uuid);
                        END IF;
                    END LOOP;
                END IF;
            END LOOP;

            -- Estado inicial: DISPONIBLE si no tiene dependencias, BLOQUEADA si tiene
            IF array_length(v_deps_nuevas, 1) IS NULL OR array_length(v_deps_nuevas, 1) = 0 THEN
                v_bloqueo_inicial := 'DISPONIBLE';
            ELSE
                v_bloqueo_inicial := 'BLOQUEADA';
            END IF;

            UPDATE public.tareas
            SET dependencias_operativas = v_deps_nuevas,
                estado_bloqueo = v_bloqueo_inicial
            WHERE id = v_instancia_tarea_id;

        -- CASO 2: La tarea de plantilla era POR UNIDAD
        ELSE
            FOR u IN 1..v_num_unidades LOOP
                v_instancia_tarea_id := (v_map_unit->>(v_pt.id::text || '_' || u::text))::uuid;
                v_deps_nuevas := '{}';

                FOR v_dep IN 
                    SELECT depende_de_id 
                    FROM public.plantilla_tareas_dependencias 
                    WHERE tarea_plantilla_id = v_pt.id 
                LOOP
                    SELECT * INTO v_dep_pt FROM public.plantilla_tareas_curso WHERE id = v_dep.depende_de_id;

                    -- Si la predecesora es GENERAL -> Depende de la general (permite paralelismo entre unidades)
                    IF v_dep_pt.aplica_por_unidad IS NOT TRUE THEN
                        IF v_map_general ? v_dep.depende_de_id::text THEN
                            v_deps_nuevas := array_append(v_deps_nuevas, (v_map_general->>v_dep.depende_de_id::text)::uuid);
                        END IF;
                    -- Si la predecesora es POR UNIDAD -> Depende de la tarea de su MISMA unidad (u)
                    ELSE
                        IF v_map_unit ? (v_dep.depende_de_id::text || '_' || u::text) THEN
                            v_deps_nuevas := array_append(v_deps_nuevas, (v_map_unit->>(v_dep.depende_de_id::text || '_' || u::text))::uuid);
                        END IF;
                    END IF;
                END LOOP;

                IF array_length(v_deps_nuevas, 1) IS NULL OR array_length(v_deps_nuevas, 1) = 0 THEN
                    v_bloqueo_inicial := 'DISPONIBLE';
                ELSE
                    v_bloqueo_inicial := 'BLOQUEADA';
                END IF;

                UPDATE public.tareas
                SET dependencias_operativas = v_deps_nuevas,
                    estado_bloqueo = v_bloqueo_inicial
                WHERE id = v_instancia_tarea_id;
            END LOOP;
        END IF;

    END LOOP;

    RETURN jsonb_build_object(
        'success', true, 
        'message', 'Secuencia de tareas instanciada exitosamente (' || v_num_unidades || ' unidades configuradas).',
        'total', (SELECT count(*) FROM public.tareas WHERE curso_id = p_curso_id AND plantilla_origen_id IS NOT NULL),
        'unidades', v_num_unidades
    );
END;
$$;
