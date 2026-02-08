# Sprint 2: Adopt desde ruta externa (opcional)

**Goal:** Permitir adoptar un proyecto que está **fuera** de `apps/` o `packages/` (por ejemplo una carpeta en otro directorio). El flujo: copiar o mover esa carpeta a `apps/<name>` o `packages/<name>`, luego ejecutar el mismo flujo que Sprint 1 (patch name, registrar en config, bun install).

**Status:** Not started

## Scope

- Sintaxis posible: `buns mono adopt app <name> --from <path>` o `buns mono adopt app <name> <path>`.
- Validar que la ruta fuente exista y contenga package.json.
- Mover o copiar el árbol de archivos a `apps/<name>` o `packages/<name>` (evitar sobrescribir sin confirmación si el destino ya existe).
- Luego: mismo flujo que adopt in-place (patch package.json name, AddApp/AddPackage, bun install).

## Tasks

| # | Task | Status | Files |
|---|------|--------|-------|
| 1 | Define CLI contract — `adopt app <name> [--from <path>]` o `adopt app <name> [<path>]`; si no se pasa path, comportamiento actual (proyecto ya en apps/name o packages/name) | pending | design |
| 2 | Port/helper to move or copy directory — FilesystemPort (init) tiene ensureDir, writeFile, deleteFile; puede faltar "copy directory" o "move directory"; extender o usar Node fs cpSync / rename | pending | design |
| 3 | AdoptProjectUseCase: accept optional source path — si se pasa path, validar origen, copiar/mover a apps/name o packages/name, luego flujo actual; si no se pasa path, flujo actual (Sprint 1) | pending | modify |
| 4 | MonoCommand.handleAdopt — parsear --from o posición; pasar source path al use case | pending | modify |
| 5 | Build and verify — adopt desde carpeta externa; comprobar que el proyecto queda en apps/ o packages/ con name actualizado y config actualizado | pending | verify |

## Acceptance criteria

- `buns mono adopt app my-app --from ../standalone-app` mueve/copia el proyecto a `apps/my-app`, registra y actualiza name.
- Sin `--from`, comportamiento de Sprint 1 (proyecto ya en apps/ o packages/).
- 0 lint errors. Build succeeds.

## Notes

- Este sprint es opcional; se puede implementar después de Sprint 1. Si la prioridad es solo adoptar proyectos ya colocados en apps/ o packages/, Sprint 1 basta.
- Decidir si "move" o "copy" (move deja la fuente vacía o la elimina; copy deja la fuente intacta). Por defecto "copy" es más seguro.
