# Design: sprint-04-incremental-build

## Technical Approach

El módulo `incremental-build` se implementa como un wrapper transparente del pipeline de build.

```
modules/incremental-build/
├── domain/
│   ├── value-objects/ContentHash.ts  ← SHA-256 VO
│   └── entities/CacheEntry.ts       ← filePath, contentHash, timestamp
├── app/
│   └── use-cases/
│       ├── CheckCacheUseCase.ts       ← check hit/miss
│       ├── UpdateCacheUseCase.ts      ← write cache
│       └── RunBuildWithCacheUseCase.ts ← orchestrates
└── infra/
    └── adapters/
        └── FsCacheAdapter.ts         ← .bunstart/cache/
```

## Decisions

1. **ContentHash**: VO que valida formato SHA-256 (64 hex chars)
2. **RunBuildWithCacheUseCase**: Orchestra: check → build → update cache
3. **No modificar ExecuteBuildUseCase**: Mantiene responsabilidad única

## Key Implementation

```typescript
// Orchestration flow
async run(input: BuildInput) {
  const cacheHit = await checkCacheUseCase.check(input)
  if (cacheHit) return { skipped: true, reason: 'cache hit' }
  
  const result = await executeBuildUseCase.execute(input)
  await updateCacheUseCase.update(input, result)
  return result
}
```

## Tests

137 tests covering hashing, cache hit/miss, corruption handling.