# Design: Optimize Build Pipeline (Lazy/Affected)

## Architecture Decision

Transition from **Eager Build** (rebuild all dependencies always) to **Lazy Build** (rebuild only when source content has changed). Inspired by Turborepo's `dependsOn: ["^build"]` caching and Nx's affected detection.

## Approach

### 1. Runtime-Only Dependency Inference

**Problem**: `SyncDependsOnFromPackageJsonUseCase` reads all dependency types (`dependencies`, `devDependencies`, `peerDependencies`, `optionalDependencies`) from `package.json` to populate `dependsOn` in `bunstart.config.ts`. This causes build tools (like `@bunstart/pack`) listed in `devDependencies` to trigger unnecessary rebuilds.

**Solution**: Only iterate `dependencies` (runtime). Build tools are `devDependencies` and should NOT define build order.

**File**: `packages/cli/src/modules/mono/app/use-cases/SyncDependsOnFromPackageJsonUseCase.ts`

### 2. Lazy Build Execution via Content Hash Caching

**Problem**: `EnsureDepsBuiltUseCase` calls `buildWorkspace.build()` for every dependency in topological order without checking if the build is actually needed.

**Solution**: Inject `CheckIfRebuildNeededUseCase` and `UpdateCacheUseCase` from `@bunstart/pack`'s `incremental-build` module (Sprint 4). Before building, check `needsRebuild`. If `false`, skip. If `true`, build and update cache.

**File**: `packages/cli/src/modules/mono/app/use-cases/EnsureDepsBuiltUseCase.ts`

### 3. Dependency Injection Wiring

**Problem**: `MonoCommandFactory.createEnsureDepsBuiltUseCase()` only passes `resolveWorkspaces` and `buildWorkspace`.

**Solution**: Instantiate `Sha256HashAdapter`, `DiskCacheAdapter`, `CheckIfRebuildNeededUseCase`, and `UpdateCacheUseCase` as static members. Pass them to `EnsureDepsBuiltUseCase` constructor.

**File**: `packages/cli/src/modules/mono/infra/factories/MonoCommandFactory.ts`

## Component Diagram

```
MonoCommand
  └── EnsureDepsBuiltUseCase
        ├── ResolveWorkspacesPort (existing)
        ├── BuildWorkspacePort (existing)
        ├── CheckIfRebuildNeededUseCase (NEW - from @bunstart/pack)
        │     ├── Sha256HashAdapter
        │     └── DiskCacheAdapter
        └── UpdateCacheUseCase (NEW - from @bunstart/pack)
              ├── Sha256HashAdapter
              └── DiskCacheAdapter
```

## Data Flow (Lazy Build)

```
1. Resolve workspaces → get dependency graph
2. Resolve build order (topological sort)
3. For each workspace in order:
   a. Compute SHA-256 hash of entrypoints
   b. Compare with cached hash
   c. IF hash matches → SKIP (log "no changes detected")
   d. IF hash differs → BUILD → update cache with new hash
4. Continue to next workspace
```

## Fail-Safe Strategy

- If `checkIfRebuildNeeded.execute()` throws → proceed with build (don't block on cache failure).
- If `updateCache.execute()` throws → log silently (cache update failure shouldn't fail the build).

## Known Limitations

- Entrypoints are hardcoded to `${workspacePath}/src/index.ts`. Future: resolve from `bunstart.config.ts` or `package.json`.
- No git-based "affected" detection yet (deferred to next phase).
- No remote caching (deferred to future phase).
