-- ============================================================================
-- PLATAFORMA CCV 3.0 — ESQUEMA DDL COMPLETO DE BASE DE DATOS (SUPABASE / POSTGRESQL)
-- Centro de Educación Virtual (CCV) - Universidad
-- ============================================================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. FASE 1: CAPA DE CONTROL, SEGURIDAD Y JERARQUÍA (CORE RBAC & RLS)
-- ----------------------------------------------------------------------------

-- Tabla de Áreas Jerárquicas
CREATE TABLE IF NOT EXISTS public.areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL UNIQUE,
    nivel INT NOT NULL CHECK (nivel BETWEEN 1 AND 6),
    parent_id UUID REFERENCES public.areas(id) ON DELETE SET NULL,
    jefe_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL, -- Jefe/Líder asignado del departamento o área
    color TEXT DEFAULT 'amber', -- Color distintivo (amber, purple, blue, emerald, cyan, rose, etc.)
    icono TEXT DEFAULT 'FolderKanban', -- Icono de Lucide React (FolderKanban, Sparkles, Video, Code2, Layers, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON COLUMN public.areas.nivel IS 'Jerarquía descendente: 6=ADMIN, 5=CMU, 4=DEPARTAMENTO, 3=FACULTAD, 2=PROGRAMA, 1=CURSO';
COMMENT ON COLUMN public.areas.parent_id IS 'Área padre para jerarquía de subáreas';
COMMENT ON COLUMN public.areas.jefe_id IS 'Usuario asignado como Jefe/Líder responsable del Departamento o Área';

CREATE INDEX IF NOT EXISTS idx_areas_parent_id ON public.areas(parent_id);
CREATE INDEX IF NOT EXISTS idx_areas_jefe_id ON public.areas(jefe_id);

-- Tabla de Roles por Área
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL UNIQUE,
    area_id UUID REFERENCES public.areas(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Definición de Permisos (CRUD + Admin)
CREATE TABLE IF NOT EXISTS public.permisos_def (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clave TEXT NOT NULL UNIQUE, -- ej: 'registro:crear', 'registro:editar', 'usuario:gestionar'
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla Puente Roles - Permisos
CREATE TABLE IF NOT EXISTS public.roles_permisos (
    rol_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    permiso_id UUID REFERENCES public.permisos_def(id) ON DELETE CASCADE,
    PRIMARY KEY (rol_id, permiso_id)
);

-- Tabla de Perfiles de Usuarios (Enlazada con auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre_completo TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    rol_id UUID REFERENCES public.roles(id) ON DELETE SET NULL,
    firma_digital TEXT, -- SVG o Base64 para validación de entregables
    avatar_url TEXT,
    telefono TEXT,
    activo BOOLEAN DEFAULT true,
    ultima_conexion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_ultima_conexion ON public.usuarios(ultima_conexion DESC);
COMMENT ON COLUMN public.usuarios.ultima_conexion IS 'Fecha y hora de última conexión o actividad del usuario en la plataforma';

-- ----------------------------------------------------------------------------
-- 2. FASE 2: ESTRUCTURA ACADÉMICA E INSTITUCIONAL (ENTIDADES BASE)
-- ----------------------------------------------------------------------------

-- Tabla de Facultades
CREATE TABLE IF NOT EXISTS public.facultades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    color TEXT DEFAULT 'emerald', -- Color distintivo (emerald, blue, purple, amber, rose, cyan, etc.)
    icono TEXT DEFAULT 'Building2', -- Nombre del icono de Lucide React
    decano_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Programas Académicos
CREATE TABLE IF NOT EXISTS public.programas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    facultad_id UUID REFERENCES public.facultades(id) ON DELETE CASCADE,
    coordinador_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Proyectos Especiales CCV
CREATE TABLE IF NOT EXISTS public.proyectos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    descripcion TEXT,
    area_id UUID REFERENCES public.areas(id) ON DELETE SET NULL,
    lider_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    estado TEXT DEFAULT 'En Proceso', -- 'Planificación', 'En Proceso', 'Completado', 'Pausado'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Cursos Virtuales
CREATE TABLE IF NOT EXISTS public.cursos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    codigo TEXT NOT NULL UNIQUE,
    programa_id UUID REFERENCES public.programas(id) ON DELETE CASCADE,
    periodo TEXT NOT NULL, -- Ej: '2026-1', '2026-2'
    docente_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    evaluador_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    numero_unidades INT NOT NULL DEFAULT 1 CHECK (numero_unidades >= 1),
    estado TEXT NOT NULL DEFAULT 'En Diseño' CHECK (estado IN ('En Diseño', 'En Producción', 'En Revisión', 'Aprobado CCV', 'Publicado LMS')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. FASE 3: MÓDULO DE GESTIÓN DE TAREAS Y COLABORACIÓN
-- ----------------------------------------------------------------------------

-- Tabla de Tareas CCV
CREATE TABLE IF NOT EXISTS public.tareas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    descripcion TEXT,
    proyecto_id UUID REFERENCES public.proyectos(id) ON DELETE CASCADE,
    curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE,
    area_id UUID REFERENCES public.areas(id) ON DELETE SET NULL,
    responsable_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    rol_destino TEXT, -- Rol funcional o especialidad ('Diseño', 'Multimedia', 'Docente', 'Par Evaluador', 'Soporte', 'General')
    categoria_proyecto TEXT, -- 'Diseño', 'Multimedia', 'Soporte', 'Transmisión'
    orden_tarea INT DEFAULT 0,
    estado TEXT NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'En Proceso', 'En Revisión', 'Completada')),
    tipo_tarea TEXT NOT NULL CHECK (tipo_tarea IN ('Curso Virtual', 'Proyecto Especial', 'Proyecto')),
    fecha_vencimiento DATE,
    fecha_completada DATE,
    tiempo_estimado NUMERIC(6, 2) DEFAULT 0.00,
    tiempo_invertido NUMERIC(6, 2) DEFAULT 0.00,
    tarifa_hora NUMERIC(10, 2) DEFAULT 0.00,
    tarifa_tarea NUMERIC(10, 2) DEFAULT 0.00,
    enlace_recurso TEXT, -- Enlace externo a recursos didácticos, Google Drive, OneDrive, Figma, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_curso_o_proyecto CHECK (
        (curso_id IS NOT NULL AND proyecto_id IS NULL) OR 
        (proyecto_id IS NOT NULL AND curso_id IS NULL) OR
        (curso_id IS NULL AND proyecto_id IS NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_tareas_curso_id ON public.tareas(curso_id);
CREATE INDEX IF NOT EXISTS idx_tareas_proyecto_id ON public.tareas(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_tareas_responsable_id ON public.tareas(responsable_id);
CREATE INDEX IF NOT EXISTS idx_tareas_estado ON public.tareas(estado);
CREATE INDEX IF NOT EXISTS idx_tareas_rol_destino ON public.tareas(rol_destino);

-- Tabla de Comentarios de Tareas
CREATE TABLE IF NOT EXISTS public.tarea_comentarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tarea_id UUID NOT NULL REFERENCES public.tareas(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    comentario TEXT NOT NULL,
    adjunto_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Registro Diario de Horas de Productividad
CREATE TABLE IF NOT EXISTS public.registro_horas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tarea_id UUID NOT NULL REFERENCES public.tareas(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    rol_destino TEXT NOT NULL,
    horas_registradas NUMERIC(5, 2) NOT NULL CHECK (horas_registradas > 0),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    descripcion_avance TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_registro_horas_fecha ON public.registro_horas(fecha);
CREATE INDEX IF NOT EXISTS idx_registro_horas_rol ON public.registro_horas(rol_destino);
CREATE INDEX IF NOT EXISTS idx_registro_horas_tarea ON public.registro_horas(tarea_id);

-- ----------------------------------------------------------------------------
-- 4. TRIGGERS Y FUNCIONES RPC AUTOMÁTICAS
-- ----------------------------------------------------------------------------

-- Función RPC para consultar los permisos clave del usuario en sesión
CREATE OR REPLACE FUNCTION public.get_mis_permisos()
RETURNS TABLE (permiso_clave TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT p.clave
    FROM public.usuarios u
    JOIN public.roles_permisos rp ON u.rol_id = rp.rol_id
    JOIN public.permisos_def p ON rp.permiso_id = p.id
    WHERE u.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función RPC Recursiva para obtener un área y todas sus subáreas descendientes
CREATE OR REPLACE FUNCTION public.get_subarea_ids(root_area_id UUID)
RETURNS TABLE (area_id UUID) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE subareas AS (
        SELECT id FROM public.areas WHERE id = root_area_id
        UNION ALL
        SELECT a.id FROM public.areas a
        INNER JOIN subareas s ON a.parent_id = s.id
    )
    SELECT id FROM subareas;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Función para manejar nuevos registros en auth.users asignando el rol enviado en metadata o Docente por defecto
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_rol_id UUID;
    v_rol_text TEXT;
BEGIN
    v_rol_text := NEW.raw_user_meta_data->>'rol_id';
    
    IF v_rol_text IS NOT NULL AND v_rol_text != '' THEN
        BEGIN
            v_rol_id := v_rol_text::UUID;
        EXCEPTION WHEN OTHERS THEN
            v_rol_id := (SELECT id FROM public.roles WHERE nombre = 'Docente' LIMIT 1);
        END;
    ELSE
        SELECT id INTO v_rol_id FROM public.roles WHERE nombre = 'Docente' LIMIT 1;
    END IF;

    INSERT INTO public.usuarios (id, nombre_completo, email, rol_id, activo)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nombre_completo', NEW.email),
        NEW.email,
        v_rol_id,
        true
    )
    ON CONFLICT (id) DO UPDATE
    SET nombre_completo = EXCLUDED.nombre_completo,
        email = EXCLUDED.email,
        rol_id = COALESCE(EXCLUDED.rol_id, public.usuarios.rol_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger cuando se registra un usuario en Supabase Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para marcar fecha_completada automáticamente al cambiar estado a 'Completada' o respetar edición del Admin
CREATE OR REPLACE FUNCTION public.handle_tarea_completada()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado = 'Completada' AND (OLD.estado IS NULL OR OLD.estado != 'Completada') THEN
        IF NEW.fecha_completada IS NULL THEN
            NEW.fecha_completada := CURRENT_DATE;
        END IF;
    ELSIF NEW.estado != 'Completada' THEN
        NEW.fecha_completada := NULL;
    END IF;
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tarea_completada ON public.tareas;
CREATE TRIGGER trg_tarea_completada
    BEFORE UPDATE ON public.tareas
    FOR EACH ROW EXECUTE FUNCTION public.handle_tarea_completada();

-- ----------------------------------------------------------------------------
-- 5. POLÍTICAS DE SEGURIDAD RLS (ROW LEVEL SECURITY)
-- ----------------------------------------------------------------------------

ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permisos_def ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles_permisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facultades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tareas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarea_comentarios ENABLE ROW LEVEL SECURITY;

-- Políticas de gestión general (Lectura e Inserción para todas las entidades académicas)
DROP POLICY IF EXISTS "Permitir lectura a usuarios autenticados" ON public.areas;
DROP POLICY IF EXISTS "Permitir gestión de áreas" ON public.areas;
CREATE POLICY "Permitir gestión de áreas" ON public.areas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir lectura a usuarios autenticados" ON public.roles;
DROP POLICY IF EXISTS "Permitir gestión de roles" ON public.roles;
CREATE POLICY "Permitir gestión de roles" ON public.roles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir lectura a usuarios autenticados" ON public.permisos_def;
DROP POLICY IF EXISTS "Permitir gestión de permisos_def" ON public.permisos_def;
CREATE POLICY "Permitir gestión de permisos_def" ON public.permisos_def FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir lectura a usuarios autenticados" ON public.roles_permisos;
DROP POLICY IF EXISTS "Permitir gestión de roles_permisos" ON public.roles_permisos;
CREATE POLICY "Permitir gestión de roles_permisos" ON public.roles_permisos FOR ALL USING (true) WITH CHECK (true);

-- Helper function para verificar rol Admin sin causar recursión infinita RLS
CREATE OR REPLACE FUNCTION public.es_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.usuarios u
        JOIN public.roles r ON u.rol_id = r.id
        JOIN public.areas a ON r.area_id = a.id
        WHERE u.id = p_user_id AND a.nivel = 6
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Políticas de lectura y modificación de entidades
DROP POLICY IF EXISTS "Permitir lectura de perfiles a usuarios autenticados" ON public.usuarios;
DROP POLICY IF EXISTS "Permitir lectura de usuarios" ON public.usuarios;
CREATE POLICY "Permitir lectura de usuarios" ON public.usuarios FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir edición a dueño o admin" ON public.usuarios;
CREATE POLICY "Permitir edición a dueño o admin" ON public.usuarios FOR UPDATE USING (
    auth.uid() = id OR public.es_admin(auth.uid())
);

DROP POLICY IF EXISTS "Permitir eliminación solo a admin" ON public.usuarios;
CREATE POLICY "Permitir eliminación solo a admin" ON public.usuarios FOR DELETE USING (
    public.es_admin(auth.uid())
);

DROP POLICY IF EXISTS "Permitir inserción de perfil propio al registrarse" ON public.usuarios;
CREATE POLICY "Permitir inserción de perfil propio al registrarse" ON public.usuarios FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir lectura de facultades a usuarios autenticados" ON public.facultades;
DROP POLICY IF EXISTS "Permitir lectura de facultades" ON public.facultades;
DROP POLICY IF EXISTS "Permitir gestión de facultades" ON public.facultades;
CREATE POLICY "Permitir gestión de facultades" ON public.facultades FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir lectura de programas a usuarios autenticados" ON public.programas;
DROP POLICY IF EXISTS "Permitir lectura de programas" ON public.programas;
DROP POLICY IF EXISTS "Permitir gestión de programas" ON public.programas;
CREATE POLICY "Permitir gestión de programas" ON public.programas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir lectura de proyectos a usuarios autenticados" ON public.proyectos;
DROP POLICY IF EXISTS "Permitir lectura de proyectos" ON public.proyectos;
DROP POLICY IF EXISTS "Permitir gestión de proyectos" ON public.proyectos;
CREATE POLICY "Permitir gestión de proyectos" ON public.proyectos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir lectura de cursos a usuarios autenticados" ON public.cursos;
DROP POLICY IF EXISTS "Permitir lectura de cursos" ON public.cursos;
DROP POLICY IF EXISTS "Permitir gestión de cursos" ON public.cursos;
CREATE POLICY "Permitir gestión de cursos" ON public.cursos FOR ALL USING (true) WITH CHECK (true);

-- Política de Tareas
DROP POLICY IF EXISTS "Visibilidad descendente de tareas por jerarquía de área" ON public.tareas;
DROP POLICY IF EXISTS "Permitir lectura de tareas" ON public.tareas;
DROP POLICY IF EXISTS "Permitir gestión de tareas" ON public.tareas;
CREATE POLICY "Permitir gestión de tareas" ON public.tareas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Lectura de comentarios por usuarios autenticados" ON public.tarea_comentarios;
CREATE POLICY "Lectura de comentarios por usuarios autenticados" ON public.tarea_comentarios FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Creación de comentarios por usuario autenticado" ON public.tarea_comentarios;
CREATE POLICY "Creación de comentarios por usuario autenticado" ON public.tarea_comentarios FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);

-- ----------------------------------------------------------------------------
-- 6. SEMILLA DE DATOS INICIALES (SEED DATA)
-- ----------------------------------------------------------------------------

-- Insertar Áreas Jerárquicas
INSERT INTO public.areas (nombre, nivel) VALUES
('ADMIN', 6),
('CMU', 5),
('DEPARTAMENTO', 4),
('FACULTAD', 3),
('PROGRAMA', 2),
('CURSO', 1)
ON CONFLICT (nombre) DO NOTHING;

-- Insertar los 9 Roles de la Plataforma
INSERT INTO public.roles (nombre, area_id) VALUES
('Administrador', (SELECT id FROM public.areas WHERE nombre = 'ADMIN')),
('Jefe', (SELECT id FROM public.areas WHERE nombre = 'CMU')),
('Diseño', (SELECT id FROM public.areas WHERE nombre = 'CMU')),
('Multimedia', (SELECT id FROM public.areas WHERE nombre = 'CMU')),
('Soporte', (SELECT id FROM public.areas WHERE nombre = 'CMU')),
('Decano', (SELECT id FROM public.areas WHERE nombre = 'FACULTAD')),
('Coordinador', (SELECT id FROM public.areas WHERE nombre = 'PROGRAMA')),
('Docente', (SELECT id FROM public.areas WHERE nombre = 'CURSO')),
('Par Evaluador', (SELECT id FROM public.areas WHERE nombre = 'CURSO'))
ON CONFLICT (nombre) DO NOTHING;

-- Insertar Permisos Clave
INSERT INTO public.permisos_def (clave, descripcion) VALUES
('registro:crear', 'Permite crear nuevos registros académicos o tareas'),
('registro:editar', 'Permite editar información de cursos y tareas'),
('registro:ver', 'Permite visualizar contenidos según nivel de área'),
('registro:eliminar', 'Permite eliminar registros del sistema'),
('tarea:aprobar', 'Permite aprobar y cambiar estado de tareas a Completado'),
('usuario:gestionar', 'Gestión total de usuarios y asignación de roles (Solo Admin)')
ON CONFLICT (clave) DO NOTHING;

-- Asignación de Permisos por Rol
-- Administrador: Todos los permisos
INSERT INTO public.roles_permisos (rol_id, permiso_id)
SELECT (SELECT id FROM public.roles WHERE nombre = 'Administrador'), id FROM public.permisos_def
ON CONFLICT DO NOTHING;

-- Jefe CCV: Todos excepto gestión de usuarios admin
INSERT INTO public.roles_permisos (rol_id, permiso_id)
SELECT (SELECT id FROM public.roles WHERE nombre = 'Jefe'), id FROM public.permisos_def WHERE clave != 'usuario:gestionar'
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 7. TRIGGER AUTOMÁTICO PARA SINCRONIZAR AUTH.USERS -> PUBLIC.USUARIOS
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_rol_id UUID;
BEGIN
    -- Obtener el rol_id enviado en user_metadata o el rol Docente por defecto
    IF NEW.raw_user_meta_data->>'rol_id' IS NOT NULL THEN
        default_rol_id := (NEW.raw_user_meta_data->>'rol_id')::UUID;
    ELSE
        SELECT id INTO default_rol_id FROM public.roles WHERE nombre = 'Docente' LIMIT 1;
        IF default_rol_id IS NULL THEN
            SELECT id INTO default_rol_id FROM public.roles LIMIT 1;
        END IF;
    END IF;

    INSERT INTO public.usuarios (
        id,
        nombre_completo,
        email,
        rol_id,
        telefono,
        activo,
        created_at
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nombre_completo', NEW.email, 'Usuario CCV'),
        NEW.email,
        default_rol_id,
        NEW.raw_user_meta_data->>'telefono',
        true,
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        nombre_completo = EXCLUDED.nombre_completo,
        email = EXCLUDED.email,
        rol_id = COALESCE(EXCLUDED.rol_id, public.usuarios.rol_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 8. FASE 8: SOLICITUDES EXTERNAS / PÚBLICAS DE TAREAS CCV
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.solicitudes_tareas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    tipo_origen TEXT NOT NULL CHECK (tipo_origen IN ('Facultad', 'Departamento/Área')),
    origen_id UUID,
    origen_nombre TEXT NOT NULL,
    fecha_estimada_entrega DATE NOT NULL,
    hora_estimada TIME,
    solicitante_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    solicitante_nombre TEXT NOT NULL,
    solicitante_email TEXT,
    solicitante_rol TEXT,
    solicitante_contacto TEXT NOT NULL,
    enlace_recurso TEXT,
    prioridad TEXT NOT NULL DEFAULT 'Normal' CHECK (prioridad IN ('Baja', 'Normal', 'Alta', 'Urgente')),
    estado TEXT NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Aprobada', 'Rechazada', 'En Evaluación')),
    motivo_rechazo TEXT,
    tarea_creada_id UUID REFERENCES public.tareas(id) ON DELETE SET NULL,
    revisado_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    fecha_revision TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON public.solicitudes_tareas(estado);
CREATE INDEX IF NOT EXISTS idx_solicitudes_solicitante ON public.solicitudes_tareas(solicitante_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_created_at ON public.solicitudes_tareas(created_at DESC);

ALTER TABLE public.solicitudes_tareas ENABLE ROW LEVEL SECURITY;

-- Política de Inserción: Permitir a cualquier usuario autenticado o anónimo registrar requerimientos
DROP POLICY IF EXISTS "Permitir inserción de solicitudes" ON public.solicitudes_tareas;
CREATE POLICY "Permitir inserción de solicitudes" 
ON public.solicitudes_tareas 
FOR INSERT 
WITH CHECK (true);

-- Política de Lectura: Administradores pueden ver todas, los solicitantes pueden ver las suyas
DROP POLICY IF EXISTS "Permitir lectura de solicitudes a Admin o solicitante" ON public.solicitudes_tareas;
CREATE POLICY "Permitir lectura de solicitudes a Admin o solicitante"
ON public.solicitudes_tareas
FOR SELECT
USING (
    public.es_admin(auth.uid()) OR 
    solicitante_id = auth.uid()
);

-- Política de Gestión solo para Administrador (Actualización y Eliminación)
DROP POLICY IF EXISTS "Permitir gestión de solicitudes solo a Admin" ON public.solicitudes_tareas;
CREATE POLICY "Permitir gestión de solicitudes solo a Admin" 
ON public.solicitudes_tareas 
FOR ALL 
USING (public.es_admin(auth.uid()))
WITH CHECK (public.es_admin(auth.uid()));

-- ----------------------------------------------------------------------------
-- 12. FASE 12: MOTOR DE PLANTILLAS Y SECUENCIA DE TAREAS POR DEPENDENCIAS (EXCLUSIVO PARA CURSOS)
-- ----------------------------------------------------------------------------

-- Tabla: Catálogo Maestro de Tareas de Plantilla
CREATE TABLE IF NOT EXISTS public.plantilla_tareas_curso (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo TEXT UNIQUE NOT NULL, -- Ej: 'T01', 'T02'
    titulo TEXT NOT NULL,
    descripcion TEXT,
    orden INT NOT NULL,
    tipo_responsable TEXT NOT NULL CHECK (tipo_responsable IN ('DOCENTE', 'PAR_EVALUADOR', 'COORDINADOR', 'DECANO', 'CMU_FIJO')),
    cmu_usuario_fijo_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    tipo_tarea TEXT DEFAULT 'PRODUCCION',
    tiempo_estimado INT DEFAULT 0, -- Minutos
    activa BOOLEAN DEFAULT true,
    aplica_por_unidad BOOLEAN DEFAULT false,
    seccion TEXT DEFAULT 'GENERAL',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plantilla_tareas_orden ON public.plantilla_tareas_curso(orden ASC);
CREATE INDEX IF NOT EXISTS idx_plantilla_tareas_activa ON public.plantilla_tareas_curso(activa);

-- Tabla: Mapeo de Dependencias Base (Qué tarea de plantilla bloquea a cuál)
CREATE TABLE IF NOT EXISTS public.plantilla_tareas_dependencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tarea_plantilla_id UUID NOT NULL REFERENCES public.plantilla_tareas_curso(id) ON DELETE CASCADE,
    depende_de_id UUID NOT NULL REFERENCES public.plantilla_tareas_curso(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_plantilla_dependencia UNIQUE (tarea_plantilla_id, depende_de_id),
    CONSTRAINT chk_no_auto_dependencia CHECK (tarea_plantilla_id <> depende_de_id)
);

CREATE INDEX IF NOT EXISTS idx_plantilla_dep_tarea ON public.plantilla_tareas_dependencias(tarea_plantilla_id);
CREATE INDEX IF NOT EXISTS idx_plantilla_dep_depende ON public.plantilla_tareas_dependencias(depende_de_id);

-- Campos adicionales en la tabla operativa de tareas
DO $$
BEGIN
    ALTER TABLE public.tareas DROP CONSTRAINT IF EXISTS tareas_rol_destino_fkey;
    ALTER TABLE public.tareas DROP CONSTRAINT IF EXISTS fk_tareas_roles;
    ALTER TABLE public.tareas ALTER COLUMN rol_destino TYPE TEXT USING rol_destino::text;
    ALTER TABLE public.tareas DROP CONSTRAINT IF EXISTS tareas_rol_destino_secundario_fkey;
    ALTER TABLE public.tareas ALTER COLUMN rol_destino_secundario TYPE TEXT USING rol_destino_secundario::text;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

ALTER TABLE public.tareas
    ADD COLUMN IF NOT EXISTS plantilla_origen_id UUID REFERENCES public.plantilla_tareas_curso(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS estado_bloqueo TEXT NOT NULL DEFAULT 'DISPONIBLE' 
        CHECK (estado_bloqueo IN ('BLOQUEADA', 'DISPONIBLE', 'EN_PROCESO', 'COMPLETADA')),
    ADD COLUMN IF NOT EXISTS dependencias_operativas UUID[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS fecha_inicial DATE,
    ADD COLUMN IF NOT EXISTS numero_unidad INT NULL;

CREATE INDEX IF NOT EXISTS idx_tareas_curso_bloqueo ON public.tareas(curso_id, estado_bloqueo);
CREATE INDEX IF NOT EXISTS idx_tareas_dependencias_gin ON public.tareas USING GIN (dependencias_operativas);
CREATE INDEX IF NOT EXISTS idx_tareas_curso_unidad ON public.tareas(curso_id, numero_unidad);

-- RLS para Plantilla de Tareas
ALTER TABLE public.plantilla_tareas_curso ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plantilla_tareas_dependencias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura pública/autenticada de plantilla de tareas" ON public.plantilla_tareas_curso;
CREATE POLICY "Lectura pública/autenticada de plantilla de tareas"
ON public.plantilla_tareas_curso FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Gestión de plantilla exclusiva para administradores" ON public.plantilla_tareas_curso;
CREATE POLICY "Gestión de plantilla exclusiva para administradores"
ON public.plantilla_tareas_curso FOR ALL
USING (public.es_admin(auth.uid()))
WITH CHECK (public.es_admin(auth.uid()));

DROP POLICY IF EXISTS "Lectura pública/autenticada de dependencias plantilla" ON public.plantilla_tareas_dependencias;
CREATE POLICY "Lectura pública/autenticada de dependencias plantilla"
ON public.plantilla_tareas_dependencias FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Gestión de dependencias plantilla exclusiva para admin" ON public.plantilla_tareas_dependencias;
CREATE POLICY "Gestión de dependencias plantilla exclusiva para admin"
ON public.plantilla_tareas_dependencias FOR ALL
USING (public.es_admin(auth.uid()))
WITH CHECK (public.es_admin(auth.uid()));

-- Función RPC: Instanciar Plantilla en un Curso
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

-- Función Trigger: Desbloqueo en Cascada y Rollback Automático
CREATE OR REPLACE FUNCTION public.fn_desbloqueo_en_cascada()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_tarea_dep RECORD;
    v_faltantes INT;
BEGIN
    -- Caso 1: La tarea pasa a Completada -> Desbloqueo de tareas dependientes
    IF (NEW.estado = 'Completada' OR NEW.estado_bloqueo = 'COMPLETADA') AND 
       (OLD.estado <> 'Completada' OR OLD.estado_bloqueo <> 'COMPLETADA') THEN
        
        NEW.estado_bloqueo := 'COMPLETADA';

        -- Buscar tareas del mismo curso bloqueadas que dependan de esta
        FOR v_tarea_dep IN
            SELECT id, dependencias_operativas
            FROM public.tareas
            WHERE curso_id = NEW.curso_id
              AND estado_bloqueo = 'BLOQUEADA'
              AND NEW.id = ANY(dependencias_operativas)
        LOOP
            -- Contar cuántas dependencias faltan por completar (excluyendo NEW que ya se está completando)
            SELECT COUNT(*) INTO v_faltantes
            FROM public.tareas
            WHERE id = ANY(v_tarea_dep.dependencias_operativas)
              AND estado <> 'Completada'
              AND id <> NEW.id;

            -- Si no falta ninguna, pasa automáticamente a DISPONIBLE
            IF v_faltantes = 0 THEN
                UPDATE public.tareas
                SET estado_bloqueo = 'DISPONIBLE'
                WHERE id = v_tarea_dep.id;
            END IF;
        END LOOP;

    -- Caso 2: Rollback - La tarea se revierte a 'Pendiente', 'En Proceso' o 'En Revisión'
    ELSIF (OLD.estado = 'Completada' OR OLD.estado_bloqueo = 'COMPLETADA') AND 
          (NEW.estado <> 'Completada' AND NEW.estado_bloqueo <> 'COMPLETADA') THEN
        
        IF NEW.estado = 'Pendiente' THEN
            NEW.estado_bloqueo := 'DISPONIBLE';
        ELSE
            NEW.estado_bloqueo := 'EN_PROCESO';
        END IF;

        -- Bloquear de nuevo las dependientes directas que aún sigan en DISPONIBLE y 'Pendiente'
        FOR v_tarea_dep IN
            SELECT id
            FROM public.tareas
            WHERE curso_id = NEW.curso_id
              AND estado_bloqueo = 'DISPONIBLE'
              AND estado = 'Pendiente'
              AND NEW.id = ANY(dependencias_operativas)
        LOOP
            UPDATE public.tareas
            SET estado_bloqueo = 'BLOQUEADA'
            WHERE id = v_tarea_dep.id;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_desbloqueo_cascada ON public.tareas;
CREATE TRIGGER trg_desbloqueo_cascada
BEFORE UPDATE ON public.tareas
FOR EACH ROW
EXECUTE FUNCTION public.fn_desbloqueo_en_cascada();

-- Función RPC: Forzar Desbloqueo Manual por Contingencia (Exclusivo Admin Nivel 6)
CREATE OR REPLACE FUNCTION public.forzar_desbloqueo_admin(p_tarea_id UUID, p_admin_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_es_admin BOOLEAN;
    v_admin_nombre TEXT;
    v_tarea RECORD;
BEGIN
    -- Validar con la función de seguridad del sistema
    v_es_admin := public.es_admin(p_admin_id);

    IF NOT v_es_admin THEN
        RETURN jsonb_build_object('success', false, 'message', 'Permiso denegado. Se requiere rol de Administrador.');
    END IF;

    SELECT u.nombre_completo INTO v_admin_nombre
    FROM public.usuarios u
    WHERE u.id = p_admin_id;

    SELECT * INTO v_tarea FROM public.tareas WHERE id = p_tarea_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Tarea no encontrada.');
    END IF;

    -- Desbloquear directamente
    UPDATE public.tareas
    SET estado_bloqueo = 'DISPONIBLE'
    WHERE id = p_tarea_id;

    -- Registrar auditoría en comentarios
    INSERT INTO public.tarea_comentarios (
        tarea_id,
        usuario_id,
        contenido
    ) VALUES (
        p_tarea_id,
        p_admin_id,
        CONCAT('⚠️ Desbloqueada manualmente por contingencia por Admin: ', COALESCE(v_admin_nombre, 'Administrador'))
    );

    RETURN jsonb_build_object('success', true, 'message', 'Tarea desbloqueada exitosamente por contingencia.');
END;
$$;



