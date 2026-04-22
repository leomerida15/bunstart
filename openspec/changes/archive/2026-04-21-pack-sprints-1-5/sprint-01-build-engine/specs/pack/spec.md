# Spec: sprint-01-build-engine

## Requirements

### Requirement: buildSetting() API

API pública `buildSetting()` como punto de entrada para configurar builds en cada workspace.

**Given** usuario quiere configurar un build
**When** llama a `buildSetting(config)`
**Then** retorna objeto con métodos `.build()`, `.serve()`, `.watch()`

### Requirement: Bun.build Wrapper

Wrapper de `Bun.build` con inteligencia contextual.

**Given** se ejecuta un build
**When** BunBuildAdapter recibe BuildConfig
**Then** ejecuta Bun.build con configuración resuelta

### Requirement: Smart Externals

Estrategia de externals diferenciada por entorno.

**Given** configuración de externals
**When** environment = "development"
**Then** todos los packages son external
**When** environment = "production"
**Then** solo user-defined externals

### Requirement: Compilación Estructurada vs Bundled

Soporte para ambos modos de compilación.

**Given** configuración de output
**When** format = "structured"
**Then** genera múltiples archivos (preserva estructura)
**When** format = "bundled"
**Then** genera bundle único

## Scenarios

| ID | Requirement | Scenario | Expected |
|----|-------------|----------|----------|
| 1 | buildSetting() | Llamar sin config | Retorna defaults |
| 2 | buildSetting() | Llamar con config custom | Aplica config |
| 3 | Smart Externals | Dev environment | Todos external |
| 4 | Smart Externals | Prod environment | Solo user-defined |