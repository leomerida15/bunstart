# Sprint 2: plugin-system

## Context

Sistema de plugins que expone la API nativa `BunPlugin` sin wrappers propietarios. Permite registrar plugins internos (como el dts-emitter) y externos (CSS pipeline: SCSS, Tailwind, PostCSS). La filosofia es: no inventar nada raro, aprovechar el ecosistema nativo de Bun.

## Dependencies

- **Depende de**: Sprint 1 (build-engine) - los plugins se integran en el pipeline de build.
- **Dependientes**: Sprint 3 (dts-emitter), Sprint 5 (asset-pipeline), Sprint 6 (dev-server).

## Estructura del Modulo

```
modules/plugin-system/
├── domain/
│   ├── entities/
│   │   ├── PluginDefinition.ts      # Metadata de un plugin (nombre, tipo, orden)
│   │   └── PluginRegistry.ts        # Registro mutable de plugins activos
│   ├── value-objects/
│   │   ├── PluginType.ts            # "internal" | "external"
│   │   └── PluginPhase.ts           # "pre-build" | "build" | "post-build"
│   ├── ports/
│   │   └── PluginLoader.port.ts     # Interface para cargar plugins (lazy/dynamic)
│   └── services/
│       ├── PluginOrderResolver.ts   # Ordena plugins segun fase y prioridad
│       └── PluginValidator.ts       # Valida que un plugin cumple la API BunPlugin
├── app/
│   └── use-cases/
│       ├── RegisterPluginUseCase.ts      # Agrega un plugin al registry
│       ├── ResolvePluginsUseCase.ts      # Resuelve y ordena plugins para un build
│       └── LoadExternalPluginUseCase.ts  # Carga lazy de plugins opcionales
├── infra/
│   ├── adapters/
│   │   └── BunPluginLoaderAdapter.ts    # Implementa PluginLoaderPort (dynamic import)
│   └── factories/
│       └── PluginSystemFactory.ts       # DI wiring
└── index.ts
```

## Pasos a Ejecutar

### Paso 1: Domain Layer
- [ ] Definir `PluginDefinition` entity con metadata: name, type, phase, priority, bunPlugin
- [ ] Implementar `PluginRegistry` entity con add/remove/getByPhase
- [ ] Implementar `PluginType` VO (internal vs external)
- [ ] Implementar `PluginPhase` VO (pre-build, build, post-build)
- [ ] Definir `PluginLoaderPort` interface
- [ ] Implementar `PluginOrderResolver` domain service
- [ ] Implementar `PluginValidator` domain service

### Paso 2: Application Layer
- [ ] Implementar `RegisterPluginUseCase` - valida y registra un plugin
- [ ] Implementar `ResolvePluginsUseCase` - dado un BuildConfig, resuelve y ordena plugins
- [ ] Implementar `LoadExternalPluginUseCase` - carga plugins como dependencias opcionales

### Paso 3: Infrastructure Layer
- [ ] Implementar `BunPluginLoaderAdapter` - dynamic import de plugins
- [ ] Implementar `PluginSystemFactory`

### Paso 4: Integracion con build-engine
- [ ] Integrar PluginRegistry en `ExecuteBuildUseCase` del build-engine
- [ ] Exponer API para que `buildSetting()` acepte `plugins: BunPlugin[]`
- [ ] Documentar API con JSDoc

### Paso 5: Tests
- [ ] Tests unitarios para PluginOrderResolver
- [ ] Tests unitarios para PluginValidator
- [ ] Tests unitarios para PluginRegistry
- [ ] Test de integracion: registrar y ejecutar un plugin mock

## Status

- [ ] Paso 1: Domain Layer
- [ ] Paso 2: Application Layer
- [ ] Paso 3: Infrastructure Layer
- [ ] Paso 4: Integracion con build-engine
- [ ] Paso 5: Tests
