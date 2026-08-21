# Regla de Sincronización Automática con GitHub

### Palabra / Comando Clave:
Cuando el usuario escriba **`-ccv sync`** (o variaciones como `ccv sync`), debes ejecutar de forma autónoma e inmediata el siguiente flujo de sincronización con el repositorio de GitHub:

### Flujo de Ejecución Requerido:
1. **Verificación de Calidad (Build):**
   - Ejecutar `npm.cmd run build` para asegurar que el proyecto compila sin errores de sintaxis, tipado o linting.
   - Si hay algún error, corregirlo o reportarlo de inmediato.

2. **Inspección de Estado y Fetch Remoto:**
   - Ejecutar `git status -s -b` y `git fetch origin`.
   - Si no hay cambios locales ni remotos, notificar que todo ya se encuentra al día.

3. **Stage y Commit Semántico:**
   - Si hay cambios locales, ejecutar `git add .` (o `git add -A`).
   - Generar un mensaje de commit claro, profesional y semántico siguiendo la convención de Conventional Commits (`feat(...)`, `fix(...)`, `refactor(...)`, `style(...)`), describiendo con precisión los cambios realizados en la sesión.

4. **Integración y Despliegue (Rebase & Push):**
   - Ejecutar `git pull --rebase origin main` para integrar limpiamente cualquier cambio remoto sin crear merge commits innecesarios.
   - Ejecutar `git push origin main`.

5. **Reporte Final al Usuario:**
   - Presentar un resumen conciso con:
     - Hash del commit generado.
     - Mensaje del commit.
     - Lista de archivos principales sincronizados.
     - Estado de confirmación de la rama `main` alineada con `origin/main`.
