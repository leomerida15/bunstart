# Sprint 2: Move monorepo domain to mono, delete repo-state

**Goal:** Move all monorepo-specific logic (entities, services, use cases, adapters) from `repo-state` into `mono`. Update all imports. Delete `repo-state` module entirely. `mono` now depends on `config-state` for config persistence.

**Status:** Done

## Tasks

| # | Task | Status | Files |
|---|------|--------|-------|
| 1 | Create `mono/domain/entities/` -- move `RepoState.ts` (rename to `RepoConfig.ts`), `AppEntry.ts`, `PackageEntry.ts` | done | move + rename |
| 2 | Create `mono/domain/value-objects/` -- move `WorkspaceId.ts` | done | move |
| 3 | Create `mono/domain/services/` -- move `BuildOrderResolver.ts`; extract `WorkspaceResolver.ts` (getPackageName, isWorkspaceAlias, getScope) from RepoState.ts | done | move + extract |
| 4 | Create `mono/domain/ports/` -- move `RunInWorkspace.port.ts`, `BuildWorkspace.port.ts` | done | move |
| 5 | Move `mono/infra/adapters/` -- move `BunRunInWorkspaceAdapter.ts`, `BunBuildWorkspaceAdapter.ts` from repo-state | done | move |
| 6 | Move use cases to `mono/app/use-cases/` -- `AddAppUseCase`, `AddPackageUseCase`, `RunInWorkspaceUseCase`, `EnsureDepsBuiltUseCase`, `SyncDependsOnFromPackageJsonUseCase` | done | move |
| 7 | Rewrite moved use cases to use `LoadConfigUseCase` + `PatchConfigUseCase` (from config-state) instead of `RepoStateStoragePort` directly | done | modify |
| 8 | Update `MonoCommand.ts` imports to use `mono/domain/` and `mono/app/use-cases/` | done | modify |
| 9 | Update `MonoCommandFactory.ts` -- wire use cases from mono + config-state factories | done | modify |
| 10 | Update `index.ts` -- replace `RepoStateUseCasesFactory` and `isWorkspaceAlias` imports with config-state + mono equivalents | done | modify |
| 11 | Update `InitCommandFactory.ts` -- use `ConfigUseCasesFactory.createInitializeConfigUseCase()` instead of repo-state | done | modify |
| 12 | Update `BootstrapBlankMonorepoUseCase.ts` -- import entities from mono instead of repo-state | done | modify |
| 13 | Delete `modules/repo-state/` entirely (19 files) | done | delete |
| 14 | Build and verify CLI compiles and runs | done | verify |
| 15 | Update `context/cli/modules/` docs -- remove `repo-state.md`, update `mono.md`, update `configState.md` status | done | modify |

## Acceptance criteria

- `modules/repo-state/` no longer exists.
- `modules/config-state/` exists with generic config operations (Load, Initialize, Patch).
- `modules/mono/` has its own domain (entities, services, ports), use cases, and adapters for monorepo management.
- `mono` use cases consume `config-state` (LoadConfig, PatchConfig) for persistence.
- All commands work: `buns init`, `buns app-example build`, `buns mono generate app x`, `buns mono sync`, `buns mono build app-example`.
- 0 lint errors.
- Build succeeds.

## Final module structure after sprint 2

```
modules/
  config-state/
    domain/
      entities/         BunstartConfig.ts
      ports/            ConfigStorage.port.ts
    app/
      use-cases/        LoadConfigUseCase, InitializeConfigUseCase, PatchConfigUseCase
    infra/
      adapters/         BunstartConfigFileAdapter
      factories/        ConfigUseCasesFactory

  init/
    domain/             (unchanged)
    app/                (unchanged, imports InitializeConfig from config-state)
    infra/              (unchanged)

  mono/
    domain/
      entities/         RepoConfig, AppEntry, PackageEntry
      value-objects/    WorkspaceId
      ports/            RunInWorkspace.port, BuildWorkspace.port
      services/         BuildOrderResolver, WorkspaceResolver
    app/
      MonoCommand.ts
      use-cases/        AddApp, AddPackage, RunInWorkspace, EnsureDepsBuilt, SyncDependsOn
    infra/
      adapters/         BunRunInWorkspaceAdapter, BunBuildWorkspaceAdapter
      factories/        MonoCommandFactory
```

## Dependency graph after sprint 2

```
index.ts
  |-> init         -> config-state
  |-> mono         -> config-state
  |                -> init (scaffolder)
  |-> run routing  -> mono (WorkspaceResolver)
                   -> config-state (LoadConfig)
```
