# Sprint 1: ResolveWorkspacesPort + adapter + comandos básicos

**Goal:** Introducir el puerto `ResolveWorkspacesPort` para resolver workspaces desde `package.json` (y opcionalmente `bunstart.config`). Migrar RunInWorkspace, list y run para usar el nuevo modelo unificado. Soporta directorios arbitrarios (apps, packages, libs, etc.) definidos en `workspaces`.

**Status:** Done

## Contexto

- Bun exige `workspaces` en package.json para monorepos. Solo trabajamos con monorepos Bun.
- Compatibilidad total: package.json define lista de workspaces; bunstart.config aporta `dependsOn` y metadata.
- Inversión de dependencias: dominio define contrato; infra implementa; use cases no dependen de clases concretas.

## Tasks

| # | Task | Status | Files |
|---|------|--------|-------|
| 1 | Create `mono/domain/value-objects/ResolvedWorkspace.ts` — `{ id, dir, name, dependsOn }` | done | new |
| 2 | Create `mono/domain/ports/ResolveWorkspaces.port.ts` — `resolve(cwd: string): Promise<ResolvedWorkspace[]>` | done | new |
| 3 | Create `mono/infra/adapters/PackageJsonWorkspacesAdapter.ts` — lee package.json raíz, resuelve globs de workspaces, lee name de cada workspace package.json; opcionalmente merge con bunstart.config para dependsOn | done | new |
| 4 | Update `WorkspaceResolver` — aceptar `ResolvedWorkspace[]` en lugar de `RepoConfig` para getPackageName, isWorkspaceAlias, getScope; o crear helpers que trabajen con ResolvedWorkspace[] | done | modify |
| 5 | Update `RunInWorkspaceUseCase` — inyectar ResolveWorkspacesPort; llamar resolve(cwd), buscar workspace por id, usar workspace.dir + workspace.id para ruta | done | modify |
| 6 | Update `BuildOrderResolver` — aceptar `ResolvedWorkspace[]`; resolver orden topológico desde dependsOn | done | modify |
| 7 | Update `BunBuildWorkspaceAdapter` — recibir ruta relativa completa (ej. `packages/pkg-a`) en lugar de kind + id; o recibir workspace | done | modify |
| 8 | Wire ResolveWorkspacesPort en MonoCommandFactory — crear adapter, inyectar en RunInWorkspaceUseCase | done | modify |
| 9 | MonoCommand list — obtener workspaces vía ResolveWorkspacesPort en lugar de config.repo | done | modify |
| 10 | index.ts direct run — usar ResolveWorkspacesPort para validar alias y obtener ruta | done | modify |
| 11 | Build and verify — `buns mono app-example build`, `buns app-example build`, list con workspaces de package.json | done | verify |

## Acceptance criteria

- Workspaces se resuelven desde `package.json` workspaces (globs como `apps/*`, `packages/*`, `libs/*`).
- `dependsOn` se obtiene de bunstart.config cuando existe; si no, array vacío o inferido de package.json.
- `buns mono app-example build` y `buns app-example build` funcionan con la nueva resolución.
- `buns mono` (list) muestra workspaces obtenidos de package.json.
- Directorios arbitrarios soportados (no solo apps/packages).
- 0 lint errors.
- Build succeeds.

## Notes

- El adapter debe resolver globs de workspaces (ej. `packages/*` → listar dirs en packages/).
- Para obtener `name` de cada workspace: leer package.json en cada directorio.
- Si bunstart.config tiene repo.apps/repo.packages, usarlos para dependsOn y opcionalmente para validar nombres.
- Este sprint no migra SyncState, SyncDependsOn, EnsureConfigSynced, add/remove; eso va en sprint-2.
