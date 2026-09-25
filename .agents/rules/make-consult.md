---
trigger: always_on
---

### Comando de Consulta y Construcción Make: `-makeconsult`

Cuando el usuario escriba o mencione el comando **`-makeconsult`** (o `makeconsult`, con o sin parámetros adicionales):

1. **Detección de la Consulta:**
   - Identificar el objetivo, módulo o flujo de automatización solicitado (ej. `-makeconsult subir archivo a google drive`, `-makeconsult iterar arrays`, o simplemente `-makeconsult` para ver la lista de manuales).

2. **Exploración de Documentación Local (`docs/Manual Make`):**
   - Consultar de inmediato los archivos markdown ubicados en `D:\Juan David\Plataforma CCV\docs\Manual Make`.
   - Utilizar herramientas de búsqueda (`grep_search`, `list_dir`, `view_file`) para encontrar las secciones exactas, configuraciones de módulos, tipos de datos, parámetros y ejemplos relevantes.
   - Si no se especifica un módulo o tema, mostrar un índice de todos los manuales y guías disponibles en dicha carpeta.

3. **Arquitectura y Asistencia de Automatización Make:**
   - Proporcionar una solución técnica estructurada como Ingeniero de Automatizaciones Senior:
     - **Flujo del Escenario:** Módulo por módulo (Triggers, Actions, Routers, Iterators, Aggregators, Directivas de error).
     - **Mapeo de Datos (Data Mapping):** Indicando exactamente cómo vincular las variables y salidas de módulos previos (`{{1.id}}`, `{{2.name}}`, etc.).
     - **Fórmulas y Transformaciones:** Uso de funciones nativas de Make (`formatDate()`, `map()`, `get()`, `join()`, etc.).
     - **Manejo de Errores y Cuotas:** Recomendaciones para optimizar el consumo de operaciones y aplicar directivas (Commit, Resume, Ignore, Break).
     - **Validación con MCP Make (si aplica):** Aprovechar las herramientas y validadores del servidor Make MCP si se requiere interactuar o validar blueprints.

4. **Referencias y Trazabilidad:**
   - Citar siempre los archivos markdown consultados mediante enlaces directos en formato Markdown (ej. `[google-drive-modules.md](file:///D:/Juan%20David/Plataforma%20CCV/docs/Manual%20Make/google-drive-modules.md)`).
