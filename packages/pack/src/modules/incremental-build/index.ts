// Domain exports
export { ContentHash } from './domain/value-objects/ContentHash';

export type { CacheEntry } from './domain/entities/CacheEntry';
export { createCacheEntry } from './domain/entities/CacheEntry';
export { BuildCache } from './domain/entities/BuildCache';

export type { CacheStoragePort } from './domain/ports/CacheStorage.port';
export type { HashCalculatorPort } from './domain/ports/HashCalculator.port';

export { ChangeDetectionService } from './domain/services/ChangeDetectionService';

// Application exports
export { CheckIfRebuildNeededUseCase } from './app/use-cases/CheckIfRebuildNeededUseCase';
export type { RebuildCheckResult } from './app/use-cases/CheckIfRebuildNeededUseCase';
export { UpdateCacheUseCase } from './app/use-cases/UpdateCacheUseCase';
export { InvalidateCacheUseCase } from './app/use-cases/InvalidateCacheUseCase';
export { RunBuildWithCacheUseCase } from './app/use-cases/RunBuildWithCacheUseCase';

// Infrastructure exports
export { DiskCacheAdapter } from './infra/adapters/DiskCacheAdapter';
export { Sha256HashAdapter } from './infra/adapters/Sha256HashAdapter';
export { IncrementalBuildFactory } from './infra/factories/IncrementalBuildFactory';