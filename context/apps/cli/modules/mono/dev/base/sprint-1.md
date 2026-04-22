# Sprint 1: Run unificado + distinción run vs native + reserved names

**Goal:** Implementar el handler unificado `mono <alias> <cmd>` que ejecute scripts o comandos nativos de Bun en un workspace. Validar nombres reservados en generate. Incluir EnsureDepsBuilt para build/dev/start en ambos entry points.

**Status:** Done

## Scope unificado

Los items 1, 2, 3, 6, 8, 9 se cubren con un solo flujo:
- `buns mono app-example build` / `buns mono app-example dev` / `buns mono app-example start` → scripts
- `buns mono app-example add lodash` → comando nativo (sin `run`)
- `buns app-example build` / `buns app-example add lodash` → mismo flujo vía index.ts direct run

## Tasks

| # | Task | Status | Files |
|---|------|--------|-------|
| 1 | Create `mono/domain/services/ReservedNames.ts` — lista de subcomandos mono, CLI global, comandos nativos Bun, flags | done | new |
| 2 | Create `mono/domain/services/NativeBunCommands.ts` — conjunto de comandos que no llevan `run`: add, install, remove, x, link, unlink, pm, outdated, update, create | done | new |
| 3 | Add validation in `AddAppUseCase` — rechazar alias que coincidan con ReservedNames | done | modify |
| 4 | Add validation in `AddPackageUseCase` — mismo que AddApp | done | modify |
| 5 | MonoCommand fallthrough — si subcommand ∉ [generate, gen, build, dev, sync, remove], tratar como `mono <alias> <cmd>`; cargar config, verificar que args[0] sea alias válido, delegar a RunInWorkspace | done | modify |
| 6 | MonoCommand: helper para decidir run vs native — si cmd es NativeBunCommands, pasar `[cmd, ...rest]`; sino `['run', cmd, ...rest]` | done | modify |
| 7 | MonoCommand: EnsureDepsBuilt para build/dev/start — en handleRunInWorkspace, antes de RunInWorkspace, llamar EnsureDepsBuilt si cmd ∈ {build, dev, start} | done | modify |
| 8 | index.ts direct run: no anteponer `run` para comandos nativos — usar NativeBunCommands para decidir si prepender run o no | done | modify |
| 9 | index.ts direct run: EnsureDepsBuilt para start — incluir `start` junto a build/dev en la condición isBuildOrDev | done | modify |
| 10 | Update MonoCommand help — mostrar `buns mono <alias> <script|cmd>` y ejemplos | done | modify |
| 11 | Build and verify — `buns mono app-example test`, `buns mono app-example add lodash`, `buns app-example add lodash`, reserved name rejection | done | verify |

## Acceptance criteria

- `buns mono app-example test` ejecuta `bun run test` en apps/app-example.
- `buns mono app-example add lodash` ejecuta `bun add lodash` (sin run) en apps/app-example.
- `buns app-example add lodash` hace lo mismo vía direct run.
- `buns mono app-example build` / `dev` / `start` ejecutan EnsureDepsBuilt antes del script.
- `buns mono gen app build` (o alias reserved) rechaza con error claro.
- Reserved names validados en AddApp y AddPackage.
- 0 lint errors.
- Build succeeds.

## Notes

- Los items 2, 8, 9 (mono start/build/dev <alias>) siguen funcionando con sintaxis `mono <script> <alias>` porque ya están implementados en MonoCommand.handleBuildOrDev. La unificación cubre `mono <alias> <script>`.
- El flujo direct run en index.ts debe compartir la lógica de native vs script (usar NativeBunCommands).
