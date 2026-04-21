# Design: sprint-02-plugin-system

## Technical Approach

Arquitectura hexagonal con plugin system:

```
modules/plugin-system/
├── domain/
│   ├── ports/PluginRegistry.port.ts
│   └── value-objects/PluginType.ts
├── app/
│   └── use-cases/RegisterPluginUseCase.ts
└── infra/
    └── adapters/InMemoryPluginRegistryAdapter.ts
```

## Decisions

1. **PluginRegistryPort**: Interface para permitir swap de registry (InMemory, Redis, etc.)
2. **PluginType VO**: Valida tipos con regex, incluye "dts"
3. **InMemoryPluginRegistryAdapter**: Implementación default en memoria

## Notes

- 84 tests covering registration, resolution, and lifecycle
- PluginType incluye: "esbuild", "typescript", "css", "dts"