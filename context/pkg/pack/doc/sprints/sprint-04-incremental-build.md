# Sprint 4: incremental-build

## Context

Sistema de builds incrementales basado en content hashing (SHA-256). Si el contenido fuente no cambio, se salta el build. Usa cache persistente en disco (`.bunstart/cache`) para mantener estado entre sesiones. Ignora timestamps de archivos (poco confiables en CI/CD).

## Dependencies

- **Depende de**: Sprint 1 (build-engine) - necesita integrarse en el pipeline de build para decidir si ejecutar o skipear.
- **Dependientes**: Ninguno. Es una optimizacion transversal.

## Estructura del Modulo

```
modules/incremental-build/
├── domain/
│   ├── entities/
│   │   ├── BuildCache.ts             # Estado del cache (mapa de hash por archivo)
│   │   └── CacheEntry.ts             # Entrada individual: path + hash + timestamp
│   ├── value-objects/
│   │   ├── ContentHash.ts            # SHA-256 hash validado
│   │   └── FileFingerprint.ts        # path + hash combinado
│   ├── ports/
│   │   ├── CacheStorage.port.ts      # Leer/escribir cache en disco
│   │   └── HashCalculator.port.ts    # Calcular hash de archivos/directorios
│   └── services/
│       └── ChangeDetectionService.ts # Compara hashes actuales vs cacheados
├── app/
│   └── use-cases/
│       ├── CheckIfRebuildNeededUseCase.ts  # Determina si un paquete necesita rebuild
│       ├── UpdateCacheUseCase.ts           # Actualiza cache despues de build exitoso
│       └── InvalidateCacheUseCase.ts       # Invalida cache (clean build)
├── infra/
│   ├── adapters/
│   │   ├── DiskCacheAdapter.ts        # Lee/escribe .bunstart/cache/
│   │   └── Sha256HashAdapter.ts       # Usa Bun crypto para SHA-256
│   └── factories/
│       └── IncrementalBuildFactory.ts
└── index.ts
```

## Pasos a Ejecutar

### Paso 1: Domain Layer
- [ ] Definir `CacheEntry` entity (filePath, contentHash, lastBuildTimestamp)
- [ ] Definir `BuildCache` entity (aggregate: mapa de CacheEntry por paquete)
- [ ] Implementar `ContentHash` VO con validacion SHA-256
- [ ] Implementar `FileFingerprint` VO
- [ ] Definir `CacheStoragePort` interface (load, save, invalidate)
- [ ] Definir `HashCalculatorPort` interface (hashFile, hashDirectory)
- [ ] Implementar `ChangeDetectionService` - compara hashes

### Paso 2: Application Layer
- [ ] Implementar `CheckIfRebuildNeededUseCase` - retorna boolean si hay cambios
- [ ] Implementar `UpdateCacheUseCase` - actualiza hashes post-build
- [ ] Implementar `InvalidateCacheUseCase` - limpia cache para clean builds

### Paso 3: Infrastructure Layer
- [ ] Implementar `DiskCacheAdapter` - JSON en `.bunstart/cache/{package-name}.json`
- [ ] Implementar `Sha256HashAdapter` - usa `Bun.CryptoHasher` para SHA-256
- [ ] Implementar `IncrementalBuildFactory`

### Paso 4: Integracion con build-engine
- [ ] Hook antes de `ExecuteBuildUseCase`: si no hay cambios, skip
- [ ] Hook despues de build exitoso: actualizar cache
- [ ] Exponer opcion `incremental: true` en `buildSetting()`
- [ ] Documentar API con JSDoc

### Paso 5: Tests
- [ ] Tests unitarios para ChangeDetectionService
- [ ] Tests unitarios para ContentHash VO
- [ ] Test de integracion: build -> cache -> no-changes -> skip
- [ ] Test de integracion: build -> modificar archivo -> rebuild
- [ ] Test: invalidar cache fuerza rebuild

## Status

- [ ] Paso 1: Domain Layer
- [ ] Paso 2: Application Layer
- [ ] Paso 3: Infrastructure Layer
- [ ] Paso 4: Integracion con build-engine
- [ ] Paso 5: Tests
