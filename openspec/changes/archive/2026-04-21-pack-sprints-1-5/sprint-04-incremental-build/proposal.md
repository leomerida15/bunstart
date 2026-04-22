# Proposal: sprint-04-incremental-build

## Summary

Content hashing SHA-256 para builds incrementales, detección de dist/, cache persistente en `.bunstart/cache`.

## Intent

- **Why**: Evitar re-builds innecesarios.
- **Scope**: Cache con SHA-256 hashing.
- **Approach**: TDD - 137 tests.

## Domain

`@bunstart/pack` - Build engine para Bunstart.

## Dependencies

- Depende de: Sprint 1 (build-engine)

## Acceptance Criteria

- [x] SHA-256 content hashing
- [x] Cache en .bunstart/cache/
- [x] Skip de archivos sin cambios
- [x] 137 tests passing