# Plan de Sincronización: bunstart → bunstart-skills

## Objetivo
Sincronizar automáticamente el skill local de bunstart con el repositorio bunstart-skills mediante un script manual.

## Paso 1: Crear estructura del skill local en bunstart

**Ubicación:** `bunstart/.opencode/skills/bunstart/SKILL.md`

**Archivos a crear:**
- `bunstart/.opencode/skills/bunstart/SKILL.md` (skill en sí)
- `bunstart/skills/bunstart/README.md` (documentación del skill)

**Contenido:** Copiar desde bunstart-skills (ya creado)

## Paso 2: Crear script de sincronización

**Ubicación:** `bunstart/scripts/sync-skill.sh`

**Funcionalidad del script:**
1. Verificar que existe el directorio del skill local
2. Copiar archivos desde `.opencode/skills/bunstart/` al repo bunstart-skills
3. Hacer git add, commit y push automáticamente
4. Mostrar mensaje de éxito o error

**Script básico:**
```bash
#!/bin/bash

# sync-skill.sh
# Sincroniza el skill local de bunstart con leomerida15/bunstart-skills

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUNSTART_DIR="$(dirname "$SCRIPT_DIR")"
SKILLS_REPO="${BUNSTART_DIR}/../bunstart-skills"
SKILL_NAME="bunstart"

echo "🔄 Sincronizando skill bunstart..."

# Verificar que existe el skill local
if [ ! -f "${BUNSTART_DIR}/.opencode/skills/${SKILL_NAME}/SKILL.md" ]; then
    echo "❌ Error: No se encuentra el skill local en .opencode/skills/${SKILL_NAME}/"
    exit 1
fi

# Verificar que existe el repo de skills
if [ ! -d "${SKILLS_REPO}" ]; then
    echo "❌ Error: No se encuentra el repositorio bunstart-skills"
    echo "   Esperado en: ${SKILLS_REPO}"
    exit 1
fi

# Copiar archivos
echo "📁 Copiando archivos..."
mkdir -p "${SKILLS_REPO}/skills/${SKILL_NAME}"
cp "${BUNSTART_DIR}/.opencode/skills/${SKILL_NAME}/SKILL.md" \
   "${SKILLS_REPO}/skills/${SKILL_NAME}/"
cp "${BUNSTART_DIR}/skills/${SKILL_NAME}/README.md" \
   "${SKILLS_REPO}/"

# Hacer commit y push
cd "${SKILLS_REPO}"
git add .

if git diff --cached --quiet; then
    echo "✅ No hay cambios para sincronizar"
    exit 0
fi

git commit -m "sync: update skill from bunstart repo

Automated sync from bunstart repository.
Changes detected in skill definition."

git push origin main

echo "✅ Skill sincronizado exitosamente!"
echo "   Repo: https://github.com/leomerida15/bunstart-skills"
```

**Permisos:**
```bash
chmod +x bunstart/scripts/sync-skill.sh
```

## Paso 3: Uso

**Sincronizar manualmente:**
```bash
cd /var/home/snor/Documents/libs/bunstart
./scripts/sync-skill.sh
```

**Flujo de trabajo:**
1. Editás el skill en `bunstart/.opencode/skills/bunstart/SKILL.md`
2. Commiteás los cambios en bunstart (opcional)
3. Corrés `./scripts/sync-skill.sh`
4. Listo, skill publicado en bunstart-skills

## Paso 4: Opcional - Hook de git

Si querés recordar sincronizar, agregar esto a `.git/hooks/pre-push`:

```bash
#!/bin/bash
# Reminder to sync skill before pushing

if [ -f ".opencode/skills/bunstart/SKILL.md" ]; then
    echo "💡 Recuerda: Si cambiaste el skill, corré ./scripts/sync-skill.sh"
fi
```

## Resumen

| Componente | Ubicación | Propósito |
|------------|-----------|-----------|
| Skill local | `bunstart/.opencode/skills/bunstart/SKILL.md` | Skill de desarrollo |
| Script sync | `bunstart/scripts/sync-skill.sh` | Sincronización manual |
| Repo público | `bunstart-skills/` | Skill publicado en skills.sh |

## Comando único para ejecutar

```bash
cd /var/home/snor/Documents/libs/bunstart && ./scripts/sync-skill.sh
```
