# INFORME TÉCNICO EXHAUSTIVO Y ARQUITECTURA DE PLATAFORMA
## PrismaLab CCV 3.0 — Centro de Educación Virtual (CCV)

**Perfil Auditor:** Arquitecto de Software Senior & Auditor Full-Stack  
**Fecha:** Septiembre 2026  
**Versión de Plataforma:** v3.0.0 (Production-Ready)  
**Documento PDF Asociado:** [Informe_Tecnico_PrismaLab_CCV.pdf](file:///d:/Juan%20David/Plataforma%20CCV/docs/Informe_Tecnico_PrismaLab_CCV.pdf)  

---

### RESUMEN EJECUTIVO
El presente informe documenta la auditoría técnica exhaustiva realizada sobre la plataforma **PrismaLab (Plataforma CCV 3.0)**. El análisis abarca la estructura de directorios, la matriz de dependencias, el modelo relacional DDL en Supabase PostgreSQL con sus políticas de seguridad RLS jerárquicas, la lógica de negocio en base de datos (RPCs y Triggers de desbloqueo en cascada), el inventario de funcionalidades activas, la configuración de variables de entorno y el diagnóstico de deuda técnica con recomendaciones para paso a producción.

---

### 1. ESTRUCTURA GENERAL Y ARQUITECTURA DE DIRECTORIOS

#### 1.1 Árbol Funcional de `/src`
```text
src/
├── app/                  # Enrutador App Router de Next.js 14, layouts, estilos globales y API routes serverless (/api/admin/users)
├── components/           # Librería modular de interfaz segmentada por 13 dominios de negocio:
│   ├── academic/         # Gestión de Facultades, Programas, Cursos, Proyectos y modales de seguimiento
│   ├── admin/            # Panel RBAC, Asignación de Roles, Tarifas por Categoría, Bandeja de Solicitudes y Plantilla Cursos
│   ├── tasks/            # Componentes de Tareas: TaskCard, TaskDetailModal y formulario dinámico
│   ├── kanban/           # Tablero Kanban con HTML5 Drag & Drop nativo y persistencia de estados
│   ├── calendar/         # Calendario de Trabajo mensual/semanal con mapeo cronológico
│   ├── planner/          # Parrilla de Publicaciones CCV y Calendario Editorial multicanal
│   ├── productivity/     # Cronómetro global flotante (GlobalTimerBar) y time-tracking
│   ├── dashboard/        # KPIs analíticos y visualizaciones con Recharts
│   ├── auth/             # Login, validación de credenciales y reseteo
│   ├── home/             # Vista principal con métricas resumidas y accesos contextuales
│   ├── layout/           # Header con simulador de roles y Sidebar de navegación
│   ├── common/           # Modales de confirmación accesibles y componentes compartidos
│   └── providers/        # Proveedor raíz de contextos de React
├── context/              # Context API: AuthContext (sesión y RBAC) y TimerContext (cronómetro)
├── lib/                  # Capa de servicios (supabase.ts, coursesService.ts, etc.) y utilidades (utils.ts)
└── types/                # Definiciones e interfaces TypeScript (Task, Course, User, PlantillaTarea, etc.)
```

#### 1.2 Patrones de Diseño Arquitectónico
- **Capa de Servicios Desacoplada (Service Layer):** Las llamadas a Supabase se concentran en `/src/lib/`, evitando que los componentes de la interfaz contengan consultas SQL o REST dispersas.
- **Separación de Responsabilidades UI / Lógica:** Los modales y paneles delegan la persistencia en funciones asíncronas dedicadas y contextos.
- **Gestión de Estado Híbrido:** Sesión y cronómetro en Context API global; datos transaccionales en llamadas asíncronas locales; estado efímero en hooks de React.
- **Backend-for-Frontend (BFF) Serverless Seguro:** Creación y gestión administrativa de usuarios delegada a `/api/admin/users` con `SUPABASE_SERVICE_ROLE_KEY`, impidiendo la exposición de claves privilegiadas al cliente.

---

### 2. MATRIZ DE DEPENDENCIAS Y TECNOLOGÍAS

| Capa / Categoría | Librería & Versión | Propósito Funcional |
| :--- | :--- | :--- |
| **Framework Core** | `next@14.2.15` | App Router, SSR, Serverless API Routes y optimización de producción. |
| **Biblioteca Base** | `react@18.3.1` / `react-dom` | Ecosistema de componentes declarativos. |
| **Tipado Estático** | `typescript@5.6.3` | Validación de contratos de datos e interfaces en tiempo de compilación. |
| **Estilos & UI** | `tailwindcss@3.4.14` | Sistema de diseño utilitario, purgado automático y responsivo. |
| **Cliente Backend** | `@supabase/supabase-js@2.45.0` | Conexión con PostgreSQL, gestión de auth, storage y RPCs. |
| **Iconografía** | `lucide-react@0.453.0` | Conjunto consistente de más de 400 iconos SVG con tree-shaking. |
| **Visualización Gráfica** | `recharts@2.13.0` | Gráficos SVG interactivos (barras, líneas, áreas y donas). |
| **Animaciones & UX** | `framer-motion@11.11.8` | Transiciones de paneles, modales e interacciones fluidas. |
| **Feedback Visual** | `canvas-confetti@1.9.4` | Animación festiva al completar tareas o cursos clave. |

*Nota sobre Drag & Drop:* Se utiliza la **HTML5 Drag & Drop API nativa**, optimizando el peso final del bundle al no requerir librerías pesadas externas.

---

### 3. MODELO DE DATOS Y CAPA BACKEND (SUPABASE)

#### 3.1 Entidades Relacionales Clave
1. `usuarios`: Perfiles extendidos conectados con `auth.users(id)` ON DELETE CASCADE. Almacena rol, firma digital, última conexión y estado activo.
2. `areas`: Estructura jerárquica institucional (Nivel 1 a 6) con relación reflexiva (`parent_id`) y jefe asignado.
3. `roles` / `permisos_def` / `roles_permisos`: Matriz RBAC configurable por roles y claves de permisos (`registro:crear`, etc.).
4. `facultades`: Unidades académicas mayores con `decano_id`.
5. `programas`: Programas académicos adscritos a facultades con `coordinador_id`.
6. `cursos`: Cursos virtuales vinculados a programas, periodo académico, docente y par evaluador asignados.
7. `proyectos`: Proyectos especiales CCV con área responsable y líder.
8. `tareas`: Unidad operativa central de trabajo. Campos: `curso_id`, `proyecto_id`, `responsable_id`, `estado`, `estado_bloqueo` (DISPONIBLE/BLOQUEADA/COMPLETADA), `dependencias_operativas` (UUID[]), `tiempo_estimado`, `tiempo_invertido`, `tarifa_tarea`.
9. `plantilla_tareas_curso`: Catálogo maestro de tareas predeterminadas con orden, rol asignado (DOCENTE, PAR_EVALUADOR, COORDINADOR, DECANO, CMU_FIJO) y duración.
10. `plantilla_tareas_dependencias`: Grafo relacional de dependencias entre tareas maestras.
11. `parrilla_publicaciones`: Calendario editorial y contenidos para redes y canales CCV.
12. `registro_horas`: Registro diario de productividad y cómputo de costos.

#### 3.2 Políticas de Seguridad RLS y Jerarquía Descendente
- **Nivel 6 (Administrador):** Acceso total sin restricciones mediante la función de seguridad `public.es_admin(auth.uid())`.
- **Nivel 5 (CMU):** Supervisión de producción audiovisual y diseño en toda la institución.
- **Nivel 4 (Departamentos):** Visibilidad recursiva mediante la función `public.get_subarea_ids(root_area_id)`.
- **Nivel 3 (Decanaturas):** Acceso a facultades y programas asociados.
- **Nivel 2 (Coordinación de Programa):** Acceso a cursos y docentes de su programa.
- **Nivel 1 (Docentes y Operativos):** Visibilidad limitada estrictamente a tareas asignadas.

*Prevención de Recursión Infinita:* `public.es_admin(user_id)` está declarada como `SECURITY DEFINER STABLE`, permitiendo consultar el rol del usuario en la tabla `usuarios` sin reactivar las políticas RLS cíclicas.

#### 3.3 Triggers y Funciones RPC
- `inicializar_tareas_curso(p_curso_id)`: Clona la plantilla maestra en un curso, asigna automáticamente docentes, evaluadores, coordinadores o decanos según el tipo de responsabilidad, y calcula el grafo de bloqueo inicial.
- `fn_desbloqueo_en_cascada()`: Trigger BEFORE UPDATE que evalúa las tareas dependientes al completarse una tarea previa y las promueve automáticamente a `DISPONIBLE`. Si se revierte una tarea completada, ejecuta rollback y vuelve a bloquear las dependientes que aún estén pendientes.
- `forzar_desbloqueo_admin(p_tarea_id, p_admin_id)`: Bypass exclusivo de Nivel 6 para desbloquear tareas trabadas por contingencia, registrando trazabilidad en comentarios.
- `handle_new_user()`: Trigger de aprovisionamiento automático ante nuevos registros en `auth.users`.

---

### 4. INVENTARIO DE FUNCIONALIDADES TÉCNICAS Y MÓDULOS ACTIVOS

1. **Autenticación y RBAC:** Sesiones seguras, asignación granular de permisos, selector dinámico de roles para pruebas administrativas.
2. **Estructura Institucional:** Navegación en dos niveles con 3 dominios de administración (`Control de Acceso & RBAC`, `Gestión Académica & Cursos`, `Operaciones & Servicios CCV`).
3. **Módulo de Tareas y Secuencia:** Pipeline secuencial con badges de bloqueo, cálculo automático de tarifas y cronómetro flotante (`GlobalTimerBar`).
4. **Vistas Avanzadas de Trabajo:**
   - Tablero Kanban con 4 columnas y animación festiva de confeti al completar tareas.
   - Calendario de Trabajo interactivo mensual y semanal.
   - Parrilla de Publicaciones CCV con filtros por canal y estado editorial.
   - Monitor de Progreso porcentual y cuellos de botella por curso virtual.
5. **Dashboard Analítico:** Tarjetas de KPI ejecutivas y gráficas de Recharts con métricas de productividad, carga horaria y cumplimiento.
6. **Canales de Integración Externa:** Sincronización con ClickUp (`clickup_task_id`), Webhooks Make/n8n para eventos, enlaces directos a carpetas en Google Drive y soporte de firma digital táctil.

---

### 5. VARIABLES DE ENTORNO Y CONEXIONES EXTERNAS

| Variable | Alcance | Descripción |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Cliente / Servidor | URL base de la instancia Supabase. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente / Servidor | Clave pública anónima protegida por RLS. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Solo Servidor** | Clave maestra con bypass de RLS para administración de cuentas. |
| `NEXT_PUBLIC_MAKE_WEBHOOK_URL` | Opcional | Endpoint para disparar automatizaciones en Make / n8n. |

---

### 6. DEUDA TÉCNICA, PUNTOS CRÍTICOS Y RECOMENDACIONES

1. **Índice GIN en Postgres:** Crear índice sobre `tareas.dependencias_operativas`:
   ```sql
   CREATE INDEX IF NOT EXISTS idx_tareas_deps_gin ON public.tareas USING GIN (dependencias_operativas);
   ```
2. **Implementación de TanStack Query (React Query):** Deduplicar peticiones a tablas maestras (facultades, programas, áreas) asignando caché de 5 minutos.
3. **Suscripción a Supabase Realtime:** Activar WebSockets en la tabla `tareas` para sincronización colaborativa multi-usuario en tiempo real dentro del Kanban.
4. **Validación de Formularios con Zod:** Centralizar la validación de esquemas en modales de creación y edición.
5. **Checklist de Producción:** Verificar que `SUPABASE_SERVICE_ROLE_KEY` se encuentre cargada en las variables de entorno de Vercel y ejecutar el script `seed_plantilla_cursos.sql` en la base de datos de producción.
