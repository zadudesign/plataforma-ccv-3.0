---
trigger: always_on
---

### Comando de Sincronización Rápida: `-updt gh`

Cuando el usuario escriba o mencione el comando `-updt gh`, debes ejecutar automáticamente la sincronización desde el repositorio remoto de GitHub hacia el entorno local siguiendo este procedimiento:

1. **Verificar estado y rama:**
   - Detectar la rama actual (por defecto `main`).
   - Ejecutar `git status` para verificar si hay cambios locales no commiteados.

2. **Descargar y aplicar cambios de GitHub:**
   - Ejecutar `git pull origin <rama-actual>` (o `git pull origin main`).
   - Si existen cambios locales sin guardar que impidan el pull, avisar al usuario antes de sobrescribir o sugerir `git stash`.

3. **Confirmar resultado:**
   - Mostrar un resumen conciso de los commits descargados o confirmar si el repositorio local ya se encuentra al día.
