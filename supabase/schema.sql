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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON COLUMN public.areas.nivel IS 'Jerarquía descendente: 6=ADMIN, 5=CMU, 4=DEPARTAMENTO, 3=FACULTAD, 2=PROGRAMA, 1=CURSO';
COMMENT ON COLUMN public.areas.parent_id IS 'Área padre para jerarquía de subáreas';

CREATE INDEX IF NOT EXISTS idx_areas_parent_id ON public.areas(parent_id);

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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. FASE 2: ESTRUCTURA ACADÉMICA E INSTITUCIONAL (ENTIDADES BASE)
-- ----------------------------------------------------------------------------

-- Tabla de Facultades
CREATE TABLE IF NOT EXISTS public.facultades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
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
    rol_destino UUID REFERENCES public.roles(id) ON DELETE SET NULL,
    orden_tarea INT DEFAULT 0,
    estado TEXT NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'En Proceso', 'En Revisión', 'Completada')),
    tipo_tarea TEXT NOT NULL CHECK (tipo_tarea IN ('Curso Virtual', 'Proyecto Especial')),
    fecha_vencimiento DATE,
    fecha_completada DATE,
    tiempo_estimado NUMERIC(6, 2) DEFAULT 0.00,
    tiempo_invertido NUMERIC(6, 2) DEFAULT 0.00,
    tarifa_tarea NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_curso_o_proyecto CHECK (
        (curso_id IS NOT NULL AND proyecto_id IS NULL) OR 
        (proyecto_id IS NOT NULL AND curso_id IS NULL) OR
        (curso_id IS NULL AND proyecto_id IS NULL)
    )
);

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

-- Trigger para marcar fecha_completada automáticamente al cambiar estado a 'Completada'
CREATE OR REPLACE FUNCTION public.handle_tarea_completada()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado = 'Completada' AND OLD.estado != 'Completada' THEN
        NEW.fecha_completada := CURRENT_DATE;
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
CREATE POLICY "Permitir lectura a usuarios autenticados" ON public.roles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir lectura a usuarios autenticados" ON public.permisos_def;
CREATE POLICY "Permitir lectura a usuarios autenticados" ON public.permisos_def FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir lectura a usuarios autenticados" ON public.roles_permisos;
CREATE POLICY "Permitir lectura a usuarios autenticados" ON public.roles_permisos FOR SELECT USING (true);

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

