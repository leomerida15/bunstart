# CLI Build Orchestration Specification

## Purpose

Defines how the CLI determines when a workspace build is necessary using content hashing (SHA-256) and explicit runtime dependency inference. Enables "lazy" build execution — skipping builds when source code has not changed.

## Requirements

### Requirement: Lazy Build Execution

The system MUST check whether a workspace rebuild is needed before executing `bun run build`. If the content hash matches the cached value, the build SHALL be skipped.

#### Scenario: Skip build when source unchanged

- GIVEN a dependency workspace has a cached SHA-256 hash matching current source
- WHEN the CLI orchestrates a build for a dependent workspace
- THEN the dependency build is skipped
- AND a cache hit message is logged

#### Scenario: Execute build when source changed

- GIVEN a dependency workspace has a cached SHA-256 hash that differs from current source
- WHEN the CLI orchestrates a build for a dependent workspace
- THEN the dependency build is executed
- AND the cache is updated with the new hash after successful build

#### Scenario: Execute build when no cache exists

- GIVEN a dependency workspace has no cached hash (first build)
- WHEN the CLI orchestrates a build for a dependent workspace
- THEN the dependency build is executed
- AND the cache is populated with the computed hash

### Requirement: Runtime-Only Dependency Inference

The system MUST infer `dependsOn` relationships exclusively from `dependencies` in `package.json`. `devDependencies` and `peerDependencies` SHALL NOT be included in build dependency resolution.

#### Scenario: Sync only runtime dependencies

- GIVEN a workspace `package.json` with `dependencies: {"@bunstart/pack": "..."}` and `devDependencies: {"typescript": "..."}`
- WHEN `SyncDependsOnFromPackageJsonUseCase` executes
- THEN only `@bunstart/pack` is added to `dependsOn`
- AND `typescript` is excluded

#### Scenario: Empty dependencies yields no dependsOn

- GIVEN a workspace `package.json` with no `dependencies` field
- WHEN `SyncDependsOnFromPackageJsonUseCase` executes
- THEN `dependsOn` remains empty

### Requirement: Content Hash Caching

The system MUST store and retrieve SHA-256 content hashes for each workspace to determine rebuild necessity. Cache entries SHALL be persisted in `.bunstart/cache/`.

#### Scenario: Cache update after successful build

- GIVEN a workspace build completes successfully
- WHEN the build orchestration finishes
- THEN `UpdateCacheUseCase` stores the new SHA-256 hash
- AND the cache file is written to `.bunstart/cache/`

#### Scenario: Cache read before build decision

- GIVEN a workspace has a previous build cache entry
- WHEN `CheckIfRebuildNeededUseCase` is invoked
- THEN the cached hash is read and compared against current source hash
- AND a boolean `needsRebuild` is returned

### Requirement: Cache Invalidation

The system MUST invalidate cache entries when source files change. A mismatch between computed and cached hash SHALL trigger a full rebuild.

#### Scenario: Hash mismatch triggers rebuild

- GIVEN cached hash `abc123` and computed hash `def456`
- WHEN `CheckIfRebuildNeededUseCase` compares them
- THEN `needsRebuild` returns `true`

#### Scenario: Hash match skips rebuild

- GIVEN cached hash `abc123` and computed hash `abc123`
- WHEN `CheckIfRebuildNeededUseCase` compares them
- THEN `needsRebuild` returns `false`

## Affected Use Cases

| Use Case | Responsibility | Change |
|----------|---------------|--------|
| `SyncDependsOnFromPackageJsonUseCase` | Dependency inference | Exclude `devDependencies` |
| `EnsureDepsBuiltUseCase` | Build orchestration | Add `needsRebuild` check before build |
| `CheckIfRebuildNeededUseCase` | Cache comparison | Injected from `@bunstart/pack` |
| `UpdateCacheUseCase` | Cache persistence | Called after successful build |

## Dependencies

- `@bunstart/pack` module `incremental-build` (SHA-256 hashing, cache I/O)
- `Sha256HashAdapter` from Pack for content hash computation

## Out of Scope

- Remote caching (future phase)
- Parallel/topological build execution (future phase)
- Git-based affected file detection (future phase)
