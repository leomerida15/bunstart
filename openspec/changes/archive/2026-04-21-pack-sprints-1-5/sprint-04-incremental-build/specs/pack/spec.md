# Spec: sprint-04-incremental-build

## Requirements

### Requirement: Content Hashing

Hash SHA-256 del contenido de archivos.

**Given** archivo fuente
**When** calcula contentHash
**Then** retorna hash SHA-256 válido

### Requirement: Cache Entry

Entrada de cache con metadata.

**Given** archivo procesado
**When** crea CacheEntry
**Then** contiene filePath, contentHash, timestamp

### Requirement: Build Cache

Gestión de cache de builds.

**Given** se ejecuta build
**When** RunBuildWithCacheUseCase.run()
**Then** check cache → build → update cache

### Requirement: Cache Storage

Persistencia en `.bunstart/cache/`.

**Given** build completado
**When** guardamos cache
**Then** escribe en .bunstart/cache/

## Scenarios

| ID | Scenario | Expected |
|----|----------|----------|
| 1 | Archivo sin cambios | Skip build |
| 2 | Archivo modificado | Re-build |
| 3 | Cache no existe | Build completo |
| 4 | Cache corrupto | Rebuild |