# Sprint 4: Alias sintácticos (opcional)

**Goal:** Permitir `mono build <alias>`, `mono dev <alias>`, `mono start <alias>` además de `mono <alias> build/dev/start`. Ambas formas son equivalentes y reutilizan el mismo flujo.

**Status:** Done

## Scope

Actualmente `mono build app-example` y `mono dev app-example` ya funcionan (handleBuildOrDev). Este sprint normaliza la lógica para que:
- `mono <script> <alias>` (script primero) → reutilice el mismo handler que `mono <alias> <script>`
- Evitar duplicación: un solo método handleRunScript(script, alias) que hace EnsureDepsBuilt + RunInWorkspace

## Tasks

| # | Task | Status | Files |
|---|------|--------|-------|
| 1 | Refactor MonoCommand — extraer handleRunScript(script, alias) usado por handleBuildOrDev y por el fallthrough cuando se detecta `mono <script> <alias>` | done | modify |
| 2 | MonoCommand routing — si args[0] ∈ {build, dev, start} y args[1] es alias válido, tratar como run script (alias segundo) | done | modify |
| 3 | Update help — documentar ambas formas: `mono <alias> <script>` y `mono build|dev|start <alias>` | done | modify |
| 4 | Build and verify | done | verify |

## Acceptance criteria

- `buns mono build app-example` y `buns mono app-example build` producen el mismo resultado.
- `buns mono dev app-example` y `buns mono app-example dev` igual.
- `buns mono start app-example` y `buns mono app-example start` igual.
- 0 lint errors.
- Build succeeds.

## Notes

- Este sprint es opcional si la prioridad es tener una sola forma canónica `mono <alias> <script>`.
- La forma `mono build <alias>` ya existe; este sprint unifica la implementación y documenta ambas.
