# Proposal: Optimize Build Pipeline (Lazy/Affected)

## Intent

The current CLI uses an "Eager" build strategy, rebuilding all dependencies regardless of whether their source code has changed. This is caused by `SyncDependsOnFromPackageJsonUseCase` incorrectly inferring `dependsOn` from `devDependencies` (e.g., `@bunstart/pack`), and `EnsureDepsBuiltUseCase` lacking a caching mechanism. This change aims to implement a "Lazy" build strategy similar to Turborepo/Nx.

## Scope

### In Scope
- Refactor `SyncDependsOnFromPackageJsonUseCase` to ignore `devDependencies` when inferring `dependsOn`.
- Modify `EnsureDepsBuiltUseCase` to integrate `CheckIfRebuildNeededUseCase` from `@bunstart/pack`.
- Skip execution of `bun run build` for dependencies if the content hash (SHA-256) matches the cache.
- Add `cli-build-orchestration` capability to define the new lazy build behavior.

### Out of Scope
- Implementing remote caching (future work).
- Parallelizing builds (requires topological sort changes, deferred to next phase).
- Git-based "affected" detection (deferred to next phase).

## Capabilities

### New Capabilities
- `cli-build-orchestration`: Defines how the CLI determines when a workspace build is necessary using content hashing and explicit runtime dependencies.

### Modified Capabilities
- None.

## Approach

1.  **Fix Dependency Inference**: Update `SyncDependsOnFromPackageJsonUseCase` to only read `dependencies` from `package.json`, ignoring `devDependencies` and `peerDependencies`.
2.  **Integrate Caching**: Inject `CheckIfRebuildNeededUseCase` (from `@bunstart/pack`) into `EnsureDepsBuiltUseCase`.
3.  **Lazy Execution**: In `EnsureDepsBuiltUseCase.execute()`, check `needsRebuild` before calling `buildWorkspace.build()`.
4.  **Cache Update**: Ensure `UpdateCacheUseCase` is called after a successful build to refresh the hash.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `packages/cli/src/modules/mono/app/use-cases/SyncDependsOnFromPackageJsonUseCase.ts` | Modified | Remove `devDependencies` from sync logic. |
| `packages/cli/src/modules/mono/app/use-cases/EnsureDepsBuiltUseCase.ts` | Modified | Add caching check before build execution. |
| `packages/cli/src/modules/mono/app/MonoCommand.ts` | Modified | Update dependency injection for `EnsureDepsBuiltUseCase`. |
| `packages/cli/src/modules/mono/infra/factories/MonoCommandFactory.ts` | Modified | Wire up `CheckIfRebuildNeededUseCase` and `UpdateCacheUseCase`. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Incorrect hash calculation leads to stale builds | Low | Use existing tested `Sha256HashAdapter` from Pack. |
| `SyncDependsOn` misses valid build dependencies | Low | Review `package.json` structure; `devDependencies` are build tools, not code deps. |

## Rollback Plan

Revert the commit. The `SyncDependsOn` logic will return to including `devDependencies`, and `EnsureDepsBuiltUseCase` will revert to eager execution.

## Dependencies

- `@bunstart/pack` module `incremental-build` (Sprint 4) must be present and functional.

## Success Criteria

- [ ] Running `buns mono build cli` does NOT rebuild `@bunstart/pack` if its source hasn't changed.
- [ ] Running `buns mono build cli` DOES rebuild `@bunstart/pack` if its source has changed.
- [ ] `bunstart.config.ts` no longer gets populated with `devDependencies`.
