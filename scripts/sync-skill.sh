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

# También actualizar README si existe
if [ -f "${BUNSTART_DIR}/skills/${SKILL_NAME}/README.md" ]; then
    cp "${BUNSTART_DIR}/skills/${SKILL_NAME}/README.md" \
       "${SKILLS_REPO}/"
fi

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
echo "   Instalación: npx skills add leomerida15/bunstart-skills"
