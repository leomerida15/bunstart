# Module: config-state

**Path (target):** `packages/cli/src/modules/config-state/`
**Replaces:** `packages/cli/src/modules/repo-state/` (partial -- generic config part only)
**Config file:** `bunstart.config.ts` (at monorepo root)
**Status:** Sprint 2 done (repo-state removed; mono uses config-state. See dev/sprint-1.md, dev/sprint-2.md)

## Purpose

Owns the `bunstart.config.ts` file as the single source of truth for all CLI framework configuration. Provides generic load, save, and patch operations. Does NOT contain monorepo-specific logic (that belongs in `mono`).

## Architecture

```
config-state/
  domain/
    entities/
      BunstartConfig.ts          # { repo?: RepoSection; [future sections] }
    ports/
      ConfigStorage.port.ts      # load(cwd): Promise<BunstartConfig | null>, save(cwd, config): Promise<void>
  app/
    use-cases/
      LoadConfigUseCase.ts       # Returns full BunstartConfig or null
      InitializeConfigUseCase.ts # Writes a new config (used by init)
      PatchConfigUseCase.ts      # Merges partial updates into existing config (section-level)
  infra/
    adapters/
      BunstartConfigFileAdapter.ts  # Reads via import(), writes by serializing TS source
    factories/
      ConfigUseCasesFactory.ts
```

## Key types

```ts
// BunstartConfig.ts
interface BunstartConfig {
  repo?: RepoSection;      // managed by mono module
  // future: build?, watch?, cli?, plugins?
}

interface RepoSection {
  apps: Record<string, { name: string; dependsOn: string[] }>;
  packages: Record<string, { name: string; dependsOn: string[] }>;
}
```

## Config file format

```ts
const bunstartConfig = {
    repo: {
        apps: {
            'app-example': { name: '@scope/app-example', dependsOn: ['pkg-example'] }
        },
        packages: {
            'pkg-example': { name: '@scope/pkg-example', dependsOn: [] }
        }
    }
};
export default bunstartConfig;
```

## Use cases

| Use case | Description |
|----------|-------------|
| `LoadConfigUseCase` | Loads full config from bunstart.config.ts. Returns null if missing. |
| `InitializeConfigUseCase` | Writes a new config file (full BunstartConfig). Used after monorepo scaffold. |
| `PatchConfigUseCase` | Merges a partial config into the existing one (e.g. update only `.repo`). Loads current, deep merges, saves. |

## Consumers

- **init**: Calls `InitializeConfigUseCase` after scaffolding to write initial config with `.repo` section.
- **mono**: Calls `LoadConfigUseCase` to read `.repo`, then `PatchConfigUseCase` to write back changes to `.repo`.
- **index.ts (run routing)**: Calls `LoadConfigUseCase` to check if alias exists in `.repo.apps` or `.repo.packages`.
- **Future modules**: Would read/write their own section via Load + Patch.

## What comes from repo-state

| From repo-state | Stays in config-state | Moves to mono |
|-----------------|----------------------|---------------|
| BunstartConfigFileAdapter | Yes (adapted for full config) | -- |
| RepoStateStoragePort | Renamed to ConfigStoragePort | -- |
| LoadRepoStateUseCase | Becomes LoadConfigUseCase | -- |
| InitializeRepoStateUseCase | Becomes InitializeConfigUseCase | -- |
| RepoState, AppEntry, PackageEntry | -- | mono/domain/entities/ |
| WorkspaceId | -- | mono/domain/value-objects/ |
| BuildOrderResolver | -- | mono/domain/services/ |
| AddAppUseCase, AddPackageUseCase | -- | mono/app/use-cases/ |
| RunInWorkspaceUseCase | -- | mono/app/use-cases/ |
| EnsureDepsBuiltUseCase | -- | mono/app/use-cases/ |
| SyncDependsOnFromPackageJsonUseCase | -- | mono/app/use-cases/ |
| RunInWorkspace.port, BuildWorkspace.port | -- | mono/domain/ports/ |
| BunRunInWorkspaceAdapter, BunBuildWorkspaceAdapter | -- | mono/infra/adapters/ |
| RepoStateUseCasesFactory | Split: config part -> ConfigUseCasesFactory | mono part -> MonoCommandFactory |
