# Design: sprint-01-build-engine

## Technical Approach

Arquitectura hexagonal con 3 capas:

```
modules/build-engine/
├── domain/           # Entidades, VOs, ports interfaces
├── app/              # Use cases
└── infrastructure/  # Adapters (Bun.build wrapper)
```

## Decisions

1. **Hexagonal Architecture**: Domain centro, dependencies pointing inward
2. **BuildEnvironment VO**: Auto-detecta dev vs prod desde Bun.env
3. **ExternalStrategy VO**: Valida estrategia con regex para package names
4. **BundlerPort**: Interface que permite swap de bundler

## Implementation Summary

Este sprint quedó absorbed en los siguientes sprints. Los archivos base fueron creados en modules/build-engine/ y modificados por los sprints 2-5.