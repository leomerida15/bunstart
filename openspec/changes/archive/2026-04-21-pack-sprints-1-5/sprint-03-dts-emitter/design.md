# Design: sprint-03-dts-emitter

## Technical Approach

```
modules/dts-emitter/
├── domain/
│   ├── ports/DtsEmitter.port.ts
│   └── value-objects/DtsConfig.ts
├── app/
│   └── use-cases/GenerateDeclarationsUseCase.ts
└── infra/
    └── adapters/BunPluginDtsAdapter.ts  ← PLACEHOLDER
```

## Decisions

1. **DtsEmitterPort**: Interface para el generador
2. **DtsConfig VO**: Config con isolatedDeclarations, outDir, etc.
3. **BunPluginDtsAdapter**: Adapter (actualmente placeholder)

## Discovery

⚠️ BunPluginDtsAdapter retorna `{ generatedFiles: [] }` - no hay integración real con bun-plugin-dts todavía. Se creó el shim de tipos pero no la implementación.

## Tests

110 tests covering DtsEmitter logic (sin el adapter real).