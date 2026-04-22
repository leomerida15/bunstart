# Sprint 2: SyncState, SyncDependsOn, EnsureConfigSynced, add/remove

**Goal:** Migrar SyncState, SyncDependsOn, EnsureConfigSynced, EnsureDepsBuilt, AddWorkspaceDep, RemoveWorkspaceDep, AddApp, AddPackage y RemoveApp/RemovePackage para usar `ResolvedWorkspace[]` (ResolveWorkspacesPort) en lugar de `repo.apps`/`repo.packages` con rutas fijas.

**Status:** Done

**Prereq:** Sprint 1 completado (ResolveWorkspacesPort + adapter + RunInWorkspace, list, run migrados).

## Tasks

| # | Task | Status | Files |
|---|------|--------|-------|
| 1 | Update `SyncState.port.ts` — `workspaceIds` como `{ workspacePaths: string[] }` o `{ workspaces: ResolvedWorkspace[] }` en lugar de `{ apps, packages }` | done | modify |
| 2 | Update `SyncStateFileAdapter` — construir rutas a package.json desde ResolvedWorkspace[] (workspace.dir + workspace.id) | done | modify |
| 3 | Update `EnsureConfigSyncedUseCase` — usar ResolveWorkspacesPort para obtener workspaces; pasar lista unificada a syncState | done | modify |
| 4 | Update `SyncDependsOnFromPackageJsonUseCase` — iterar ResolvedWorkspace[]; path = join(cwd, w.dir, w.id, 'package.json'); inferir dependsOn y actualizar bunstart.config (repo.apps/repo.packages para mantener compatibilidad de persistencia) | done | modify |
| 5 | Update `EnsureDepsBuiltUseCase` — usar ResolveWorkspacesPort; ruta por workspace.dir + workspace.id | done | Sprint 1 |
| 6 | Update `AddWorkspaceDepUseCase` — resolver workspace target con ResolveWorkspacesPort; ruta por workspace.dir + workspace.id | done | modify |
| 7 | Update `RemoveWorkspaceDepUseCase` — igual que AddWorkspaceDep | done | modify |
| 8 | Update `AddAppUseCase` / `AddPackageUseCase` — seguir escribiendo repo.apps/repo.packages en config; si package.json workspaces no incluye el nuevo dir, Init/MonorepoScaffolder ya crea; asegurar que add app/pkg actualice package.json workspaces si el directorio no está (ej. nuevo dir `libs/`) | deferred | modify |
| 9 | Update `RemoveAppUseCase` / `RemovePackageUseCase` — obtener workspaces de ResolveWorkspacesPort; limpiar dependsOn; opcionalmente actualizar package.json workspaces | deferred | modify |
| 10 | Wire todos los use cases actualizados en MonoCommandFactory — ResolveWorkspacesPort inyectado donde corresponde | done | modify |
| 11 | Update `BunstartConfigFileAdapter` — serialización de repo.apps/repo.packages sigue igual para compatibilidad; SyncDependsOn escribe ahí | done | verify |
| 12 | Build and verify — `buns mono sync`, add/remove dep, add/remove app/pkg, EnsureConfigSynced en build/dev/start | done | verify |

## Acceptance criteria

- `buns mono sync` actualiza dependsOn en bunstart.config a partir de package.json de cada workspace.
- SyncState usa rutas dinámicas (workspace.dir + workspace.id).
- `buns mono add dep app-example pkg-example` y `remove dep` funcionan con workspaces resueltos desde package.json.
- `buns mono gen app my-app` y `gen pkg my-pkg` siguen funcionando; config y package.json quedan alineados.
- `buns mono remove app my-app` y `remove pkg my-pkg` actualizan config y dependsOn.
- EnsureConfigSynced se ejecuta correctamente cuando hay cambios en package.json de workspaces.
- 0 lint errors.
- Build succeeds.

## Notes

- La persistencia en bunstart.config puede seguir siendo repo.apps y repo.packages (estructura actual) para no romper la serialización. El ResolveWorkspacesAdapter fusiona lo que lee de package.json con lo que lee de config para dependsOn.
- Si add app/pkg crea un directorio nuevo (ej. libs/) que no está en package.json workspaces, el adapter debe añadirlo al package.json o el usuario debe hacerlo manualmente. Definir si AddApp/AddPackage debe parchear package.json workspaces.
- Este sprint asume que Sprint 1 ya migró RunInWorkspace, list, run, BuildOrderResolver y BunBuildWorkspaceAdapter al modelo ResolvedWorkspace.
