# Proposal: sprint-01-build-engine

## Summary

Implementar el módulo fundacional `build-engine` para `@bunstart/pack`: API pública `buildSetting()` que envuelve `Bun.build` con inteligencia contextual (dev vs prod), smart externals, y soporte para compilación estructurada vs bundled.

## Intent

- **Why**: Sin este módulo, ningún otro módulo puede funcionar (todos dependen de él).
- **Scope**: Módulo completo con arquitectura hexagonal (domain/app/infra).
- **Approach**: TDD - tests primero, código después.

## Domain

`@bunstart/pack` - Build engine para Bunstart.

## Dependencies

- **Depende de**: Ninguno (es el primer sprint).
- **Dependientes**: Sprint 2, 3, 4, 5, 6.

## Requirements

1. API pública `buildSetting()` como punto de entrada
2. Wrapping de `Bun.build` con inteligencia contextual
3. Smart externals (dev vs prod)
4. Soporte compilación estructurada vs bundled
5. Arquitectura hexagonal completa

## Acceptance Criteria

- [x] Tests pasan
- [x] Código compila con tsc --noEmit
- [x] API documentada con JSDoc