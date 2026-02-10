# Sprint 3: bun install después de generate

**Goal:** Ejecutar `bun install` en la raíz del monorepo después de generar un nuevo app o package, para que el lockfile resuelva el nuevo workspace.

**Status:** Done

## Tasks

| # | Task | Status | Files |
|---|------|--------|-------|
| 1 | Create `mono/domain/ports/RunBunInstall.port.ts` — `execute(cwd: string): Promise<void>` | done | new |
| 2 | Create `mono/infra/adapters/BunRunBunInstallAdapter.ts` — ejecuta `bun install` en cwd (spawn) | done | new |
| 3 | Wire adapter in MonoCommandFactory — crear RunBunInstallPort impl | done | modify |
| 4 | MonoCommand.handleGenerate: después de AddApp/AddPackage + scaffold, llamar RunBunInstallPort.execute(cwd) con cwd = monorepo root | done | modify |
| 5 | Build and verify — `buns mono gen app my-app` debe ejecutar `bun install` al final | done | verify |

## Acceptance criteria

- `buns mono gen app my-app` ejecuta `bun install` en la raíz tras scaffoldear.
- `buns mono gen pkg shared-utils` igual.
- El lockfile se actualiza y el nuevo workspace queda resuelto.
- 0 lint errors.
- Build succeeds.

## Notes

- El cwd pasado al use case ya es la raíz del monorepo. No hace falta cambiar de directorio.
- El adapter puede ser un simple spawn de `bun install` con cwd.
