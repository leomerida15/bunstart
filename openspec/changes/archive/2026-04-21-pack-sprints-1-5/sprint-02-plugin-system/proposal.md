# Proposal: sprint-02-plugin-system

## Summary

Sistema de plugins nativo BunPlugin para `@bunstart/pack`: registro, resolución, soporte CSS pipeline (SCSS, Tailwind, PostCSS), y PluginType extendido.

## Intent

- **Why**: Los módulos dts-emitter, asset-pipeline, y dev-server necesitan un sistema de plugins.
- **Scope**: Plugin system completo con arquitectura hexagonal.
- **Approach**: TDD - 84 tests.

## Domain

`@bunstart/pack` - Build engine para Bunstart.

## Dependencies

- Depende de: Sprint 1 (build-engine)
- Dependientes: Sprint 3 (dts-emitter), Sprint 5 (asset-pipeline), Sprint 6 (dev-server)

## Acceptance Criteria

- [x] Plugin registry funcional
- [x] Plugin resolution
- [x] PluginType extendido (incluye "dts")
- [x] 84 tests passing