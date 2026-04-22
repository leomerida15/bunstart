# Sprint 1: build-engine

## Context

Este es el modulo fundacional de `@bunstart/pack`. Define la API publica `buildSetting()` que es el punto de entrada para configurar builds en cada workspace. Envuelve `Bun.build` con inteligencia contextual (dev vs prod), smart externals, y soporte para compilacion estructurada vs bundled.

Sin este modulo, ningun otro modulo puede funcionar.

## Dependencies

- **Depende de**: Ninguno (es el primer sprint).
- **Dependientes**: Sprint 2 (plugin-system), Sprint 4 (incremental-build), Sprint 5 (asset-pipeline), Sprint 6 (dev-server). TODOS dependen de este.

## Estructura del Modulo

```
modules/build-engine/
├── domain/
│   ├── entities/
│   │   ├── BuildConfig.ts          # Configuracion completa de un build
│   │   ├── BuildResult.ts          # Resultado de una ejecucion de build
│   │   └── EntryPoint.ts           # Entrypoint resuelto con metadata
│   ├── value-objects/
│   │   ├── ExternalStrategy.ts     # "development" | "production" + reglas
│   │   ├── OutputFormat.ts         # "esm" | "cjs" | "iife"
│   │   └── BuildEnvironment.ts     # "development" | "production" (auto-detectado)
│   ├── ports/
│   │   ├── Bundler.port.ts         # Interface para ejecutar el build (Bun.build)
│   │   └── PackageAnalyzer.port.ts # Interface para leer package.json y resolver externals
│   └── services/
│       ├── ExternalsResolver.ts    # Logica de resolucion dev vs prod externals
│       └── EntryPointResolver.ts   # Resolucion de entrypoints desde config
├── app/
│   └── use-cases/
│       ├── ExecuteBuildUseCase.ts           # Ejecuta un build completo
│       ├── CreateBuildSettingsUseCase.ts    # Crea la configuracion desde user input
│       └── ResolveBuildConfigUseCase.ts     # Resuelve config con defaults inteligentes
├── infra/
│   ├── adapters/
│   │   ├── BunBuildAdapter.ts              # Implementa BundlerPort con Bun.build()
│   │   └── PackageJsonAnalyzerAdapter.ts   # Implementa PackageAnalyzerPort
│   └── factories/
│       └── BuildEngineFactory.ts           # DI wiring
└── index.ts                                # Barrel export del modulo
```

## Pasos a Ejecutar

### Paso 1: Domain Layer
- [ ] Definir `BuildConfig` entity con todas las opciones de configuracion
- [ ] Definir `BuildResult` entity con outputs, errores, metricas
- [ ] Definir `EntryPoint` entity
- [ ] Implementar `ExternalStrategy` VO con validacion (dev: all external, prod: user-defined)
- [ ] Implementar `OutputFormat` VO
- [ ] Implementar `BuildEnvironment` VO con auto-deteccion
- [ ] Implementar `ExternalsResolver` domain service
- [ ] Implementar `EntryPointResolver` domain service
- [ ] Definir `BundlerPort` interface
- [ ] Definir `PackageAnalyzerPort` interface

### Paso 2: Application Layer
- [ ] Implementar `CreateBuildSettingsUseCase` - parsea user config y crea BuildConfig
- [ ] Implementar `ResolveBuildConfigUseCase` - aplica defaults segun environment
- [ ] Implementar `ExecuteBuildUseCase` - orquesta bundler + plugins + post-processing

### Paso 3: Infrastructure Layer
- [ ] Implementar `BunBuildAdapter` - wrapper de `Bun.build()` que implementa BundlerPort
- [ ] Implementar `PackageJsonAnalyzerAdapter` - lee package.json para externals
- [ ] Implementar `BuildEngineFactory` - wiring DI

### Paso 4: Public API
- [ ] Exportar `buildSetting()` como funcion principal en `packages/pack/src/index.ts`
- [ ] La funcion retorna objeto con metodos `.build()`, `.serve()`, `.watch()`
- [ ] Documentar API con JSDoc

### Paso 5: Tests
- [ ] Tests unitarios para ExternalsResolver
- [ ] Tests unitarios para EntryPointResolver
- [ ] Tests de integracion para ExecuteBuildUseCase con mocks
- [ ] Test E2E: buildSetting() con un proyecto minimal

## Status

- [ ] Paso 1: Domain Layer
- [ ] Paso 2: Application Layer
- [ ] Paso 3: Infrastructure Layer
- [ ] Paso 4: Public API
- [ ] Paso 5: Tests
