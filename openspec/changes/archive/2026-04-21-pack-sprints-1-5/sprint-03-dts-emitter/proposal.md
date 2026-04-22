# Proposal: sprint-03-dts-emitter

## Summary

Plugin interno para emisión de `.d.ts` con `bun-plugin-dts` y `isolatedDeclarations: true` (TS 5.5+).

## Intent

- **Why**: Generar tipos TypeScript automáticamente.
- **Scope**: DtsEmitter con arquitectura hexagonal.
- **Approach**: TDD - 110 tests.

## Domain

`@bunstart/pack` - Build engine para Bunstart.

## Dependencies

- Depende de: Sprint 2 (plugin-system)
- Dependientes: Ninguno directo

## Acceptance Criteria

- [x] DtsEmitter genera .d.ts
- [x] 110 tests passing
- [⚠️] Adapter es placeholder - no integración real con bun-plugin-dts