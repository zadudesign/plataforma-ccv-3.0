---
trigger: always_on
---

### Comando de Sincronización Automática: `-ccv sync`

Cuando el usuario escriba o mencione el comando **`-ccv sync`** (o `ccv sync`), debes ejecutar de forma autónoma e inmediata el siguiente flujo para sincronizar todos los cambios locales hacia el repositorio en GitHub:

1. **Inspección de Estado y Cambios:**
   - Detectar la rama actual (por defecto `main`).
   - Ejecutar `git status -s -b` y `git fetch origin` para revisar el estado local y remoto.
   - Si no hay cambios locales que guardar ni remotos que bajar, notificar al usuario que el repositorio ya está al día.

2. **Preparación y Commit Semántico:**
   - Ejecutar `git add .` para incluir todos los archivos creados, modificados o eliminados.
   - Generar automáticamente un mensaje de commit profesional y descriptivo siguiendo el estándar de Conventional Commits (ej. `feat(...)`, `fix(...)`, `refactor(...)`, `style(...)`), que describa con precisión las modificaciones efectuadas.

3. **Sincronización Remota (Pull & Push):**
   - Ejecutar `git pull --rebase origin <rama-actual>` para integrar cualquier cambio remoto de forma limpia.
   - Ejecutar `git push origin <rama-actual>` para subir los cambios a GitHub.

4. **Confirmación y Reporte Final:**
   - Presentar un resumen conciso y elegante al usuario indicando:
     - Hash del commit generado.
     - Mensaje del commit.
     - Rama donde se realizaron los cambios (`main`).
     - Confirmación de sincronización exitosa con GitHub.
