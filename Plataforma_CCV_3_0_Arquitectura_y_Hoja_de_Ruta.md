# Documento Base de Arquitectura y Hoja de Ruta de Desarrollo
## Plataforma CCV 3.0 — Sistema de Gestión de Cursos Virtuales y Tareas

---

### 📋 Resumen del Proyecto

La **Plataforma CCV 3.0** es un ecosistema de software diseñado para la gestión, seguimiento, producción y supervisión de cursos virtuales, diseño instruccional y proyectos especiales. Actúa como el núcleo centralizador entre los procesos académicos institucionales, decanos, coordinadores, docentes, evaluadores de calidad y el equipo de producción multimedia del Centro de Educación Virtual (CCV).

---

## 🏗️ Hoja de Ruta Secuencial de Desarrollo

---

### **Fase 1: Capa de Control, Seguridad y Jerarquía (Core RBAC & RLS)**

#### **Objetivo**
Establecer la estructura base de autenticación, áreas, roles, permisos y la regla de visibilidad descendente (Row Level Security - RLS).

#### **Componentes Backend (Supabase)**
1. **Tabla `areas`**:
   - `id`: UUID (Primary Key)
   - `nombre`: Text (Unique) — *ADMIN, CMU, DEPARTAMENTO, FACULTAD, PROGRAMA, CURSO*
   - `nivel`: Integer — Orden jerárquico descendente:
     - `ADMIN` = 6
     - `CMU` = 5
     - `DEPARTAMENTO` = 4
     - `FACULTAD` = 3
     - `PROGRAMA` = 2
     - `CURSO` = 1

2. **Tabla `roles`**:
   - `id`: UUID (Primary Key)
   - `nombre`: Text — *Administrador, Diseño, Multimedia, Soporte, Jefe, Decano, Coordinador, Docente, Par Evaluador*
   - `area_id`: UUID (Foreign Key -> `areas.id` ON DELETE CASCADE)

3. **Tabla `permisos_def`**:
   - `id`: UUID (Primary Key)
   - `clave`: Text (Unique) — Identificadores de permisos CRUD (*registro:crear*, *registro:editar*, *registro:ver*, *registro:eliminar*)
   - `descripcion`: Text

4. **Tabla Puente `roles_permisos`**:
   - Relaciona los roles con las definiciones de permisos (`rol_id`, `permiso_id`).

5. **Tabla `usuarios` (Perfiles)**:
   - `id`: UUID (Primary Key -> enlazado con `auth.users`)
   - `nombre_completo`: Text
   - `email`: Text
   - `rol_id`: UUID (Foreign Key -> `roles.id`)
   - `firma_digital`: Text (SVG/Base64 para validación de entregables)

6. **Reglas de Seguridad y Visibilidad (RLS)**:
   - Configuración de políticas RLS descendentes: Los usuarios con jerarquía superior en la cadena organizativa pueden visualizar y gestionar el contenido de las áreas inferiores adscritas a su línea.

#### **Componentes Frontend (React)**
- Pantalla de inicio de sesión (/login) conectada a Supabase Auth.
- Interfaz administrativa para la gestión de usuarios, visualización de roles y sus respectivos niveles jerárquicos.

---

### **Fase 2: Estructura Académica e Institucional (Entidades Base)**

#### **Objetivo**
Definir las entidades organizacionales sobre las cuales se agrupará la gestión académica y el trabajo de producción.

#### **Componentes Backend (Supabase)**
1. **Tabla `facultades`**:
   - `id`: UUID (Primary Key)
   - `nombre`: Text
   - `decano_id`: UUID (Foreign Key -> `usuarios.id`)

2. **Tabla `programas`**:
   - `id`: UUID (Primary Key)
   - `nombre`: Text
   - `facultad_id`: UUID (Foreign Key -> `facultades.id`)
   - `coordinador_id`: UUID (Foreign Key -> `usuarios.id`)

3. **Tabla `proyectos`**:
   - `id`: UUID (Primary Key)
   - `nombre`: Text
   - `descripcion`: Text
   - `area_id`: UUID (Foreign Key -> `areas.id`)

4. **Tabla `cursos`**:
   - `id`: UUID (Primary Key)
   - `nombre`: Text
   - `codigo`: Text
   - `programa_id`: UUID (Foreign Key -> `programas.id`)
   - `periodo`: Text
   - `docente_id`: UUID (Foreign Key -> `usuarios.id`)
   - `evaluador_id`: UUID (Foreign Key -> `usuarios.id`)
   - `estado`: Text

#### **Componentes Frontend (React)**
- **Admin Dashboard**: Panel exclusivo para el rol Administrador para la gestión de Áreas, Facultades, Programas, Cursos y Proyectos mediante tablas interactivas y modales.
- Vista navegable de Proyectos y Cursos adaptada al nivel jerárquico del usuario autenticado.

---

### **Fase 3: Módulo de Gestión de Tareas y Colaboración**

#### **Objetivo**
Habilitar la creación, asignación, seguimiento financiero, estimación de tiempos y discusión colaborativa de tareas.

#### **Componentes Backend (Supabase)**
1. **Tabla `tareas`**:
   - `id`: UUID (Primary Key)
   - `titulo`: Text
   - `descripcion`: Text
   - `proyecto_id`: UUID (Foreign Key -> `proyectos.id`, Nullable)
   - `curso_id`: UUID (Foreign Key -> `cursos.id`, Nullable)
   - `area_id`: UUID (Foreign Key -> `areas.id`)
   - `responsable_id`: UUID (Foreign Key -> `usuarios.id`)
   - `orden_tarea`: Integer
   - `estado`: Text (*Pendiente, En Proceso, En Revisión, Completado*)
   - `fecha_vencimiento`: Date
   - `fecha_completada`: Date
   - `tiempo_estimado`: Numeric
   - `tiempo_invertido`: Numeric
   - `tipo_tarea`: Text
   - `tarifa_tarea`: Numeric
   - `rol_destino`: UUID (Foreign Key -> `roles.id`)
   - `clickup_task_id`: Text (Para sincronización externa)

2. **Tabla `tarea_comentarios`**:
   - `id`: UUID (Primary Key)
   - `tarea_id`: UUID (Foreign Key -> `tareas.id` ON DELETE CASCADE)
   - `usuario_id`: UUID (Foreign Key -> `usuarios.id`)
   - `comentario`: Text
   - `created_at`: Timestamp with time zone

#### **Componentes Frontend (React)**
- **Formulario Dinámico de Creación de Tareas**: Selección del tipo (Curso vs. Proyecto Especial) con selectores filtrados en cascada jerárquica (*Área -> Facultad -> Programa -> Curso*).
- **Modal / Panel Lateral de Detalle de Tarea**:
  - Información de procedencia y jerarquía.
  - Formulario de actualización de estado y registro de tiempos.
  - Métricas financieras (Costo estimado / Tarifa).
  - Historial y panel de comentarios en tiempo real.

---

### **Fase 4: Agrupación Académica, Monitoreo y Visualizaciones Avanzadas**

#### **Objetivo**
Ofrecer interfaces enriquecidas para la supervisión global, agilidad operativa y seguimiento cronológico.

#### **Componentes Frontend (React)**
1. **Sección "Estructura Académica"**:
   - Navegación organizada en vista de árbol / acordeón por **Cursos por Facultad** y **Proyectos Especiales**.
   - Buscador por texto rápido (título, responsable, tipo de tarea) con filtros RLS aplicados automáticamente.

2. **Tablero Kanban**:
   - Agrupación visual por columnas verticales según el campo `estado` (*Pendiente, En Proceso, En Revisión, Completado*).
   - Tarjetas informativas con Título, Responsable, Tipo de Tarea y fecha de vencimiento.
   - Funcionalidad *Drag and Drop* (arrastrar y soltar) que actualiza automáticamente el estado en Supabase y asigna la `fecha_completada` al mover a *Completado*.

3. **Calendario de Trabajo**:
   - Vista cronológica mensual y semanal basada en `fecha_vencimiento`.
   - Colores diferenciados según el estado o tipo de tarea.
   - Apertura directa del modal de detalle al hacer clic en cualquier tarea del calendario.

---

## 🔌 Integraciones y Eventos Externos

1. **Webhooks de Creación (Make / n8n)**:
   - Envío de payloads JSON al insertar cursos o tareas para aprovisionamiento automatizado.
2. **Sincronización con ClickUp**:
   - Endpoint / Edge Function en Supabase para sincronizar eventos (`taskStatusUpdated`, `taskTimeTracked`, `taskDeleted`).
3. **Estructura de Documentos en Google Drive**:
   - Creación automática de carpetas parametrizadas (*01. Syllabus, 02. Material de Apoyo, 03. Guiones, 04. Multimedia*).
4. **Firma Digital Integrada**:
   - Captura de firmas con `SignaturePad` almacenadas en la base de datos para la validación de entregables.
