# Tasks: Optimize Build Pipeline (Lazy/Affected)

## Phase 1: Foundation & Dependency Inference

- [x] 1.1 Modify `packages/cli/src/modules/mono/app/use-cases/SyncDependsOnFromPackageJsonUseCase.ts`: Remove loops for `devDependencies`, `peerDependencies`, `optionalDependencies`. Only read `dependencies`.
- [x] 1.2 Update `packages/cli/src/modules/mono/infra/factories/MonoCommandFactory.ts`: Instantiate and inject `CheckIfRebuildNeededUseCase` and `UpdateCacheUseCase` from `@bunstart/pack` into `EnsureDepsBuiltUseCase`.
- [x] 1.3 Update `packages/cli/src/modules/mono/app/MonoCommand.ts`: Accept new dependencies in constructor and pass them to `EnsureDepsBuiltUseCase`.

## Phase 2: Core Implementation (Lazy Execution)

- [x] 2.1 Refactor `packages/cli/src/modules/mono/app/use-cases/EnsureDepsBuiltUseCase.ts` constructor: Add `checkIfRebuildNeeded: CheckIfRebuildNeededUseCase` and `updateCache: UpdateCacheUseCase`.
- [x] 2.2 Modify `EnsureDepsBuiltUseCase.execute()`: Before iterating `order`, resolve workspace entrypoints. Call `checkIfRebuildNeeded.execute(packageName, entrypoints)`. Skip `buildWorkspace.build()` if `needsRebuild` is false.
- [x] 2.3 After successful `buildWorkspace.build()`, call `updateCache.execute(packageName, entrypoints)` to persist new hash.

## Phase 3: Testing

- [x] 3.1 Write unit test for `SyncDependsOnFromPackageJsonUseCase`: Verify `devDependencies` are ignored and only `dependencies` populate `dependsOn`.
- [x] 3.2 Write unit test for `EnsureDepsBuiltUseCase`: Mock `CheckIfRebuildNeededUseCase` to return `false` and verify `buildWorkspace.build()` is NOT called.
- [x] 3.3 Write unit test for `EnsureDepsBuiltUseCase`: Mock `CheckIfRebuildNeededUseCase` to return `true` and verify `buildWorkspace.build()` IS called.
- [x] 3.4 Write integration test: Simulate full CLI flow ensuring `buns mono build cli` skips `@bunstart/pack` build if hash matches.
