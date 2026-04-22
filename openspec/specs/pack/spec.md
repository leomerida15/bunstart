# @bunstart/pack - Build Engine Specification

## Overview

Build engine modular para el ecosistema Bunstart. API pública `buildSetting()` como punto de entrada para configurar y ejecutar builds en cada workspace.

## Architecture

Cada módulo sigue arquitectura hexagonal (domain/app/infra):
- **domain/**: Entidades, VOs, ports interfaces
- **app/**: Use cases
- **infra/**: Adapters (implementaciones concretas)

## Modules

| # | Module | Description | Status |
|---|--------|-------------|--------|
| 1 | build-engine | Core: buildSetting() API, Bun.build wrapper, smart externals | ✅ Complete |
| 2 | plugin-system | Plugin registry, resolution, PluginType | ✅ Complete |
| 3 | dts-emitter | .d.ts generation con bun-plugin-dts | ⚠️ Partial |
| 4 | incremental-build | SHA-256 cache, .bunstart/cache/ | ✅ Complete |
| 5 | asset-pipeline | Assets, LightningCSS, HTML injection | ✅ Complete |
| 6 | dev-server | Bun.serve, HMR | 🔲 Pending |

## Requirements

### Requirement: buildSetting() API

API pública `buildSetting()` como punto de entrada.

**Given** usuario quiere configurar un build
**When** llama a `buildSetting(config)`
**Then** retorna objeto con métodos `.build()`, `.serve()`, `.watch()`

### Requirement: Smart Externals

Estrategia de externals diferenciada por entorno.

**When** environment = "development" → todos external
**When** environment = "production" → solo user-defined

### Requirement: Plugin Registry

Sistema de registro de plugins.

**When** registry.register(plugin) → plugin disponible
**When** registry.resolve(type) → retorna plugin

### Requirement: PluginType Extension

Extensión de PluginType para incluir "dts".

**Valid types**: "esbuild", "typescript", "css", "dts"

### Requirement: DtsEmitter

Generador de declaraciones TypeScript.

⚠️ **PENDING**: BunPluginDtsAdapter es placeholder - integración real pendiente

### Requirement: Incremental Build

Content hashing SHA-256 para builds incrementales.

**When** archivo sin cambios → skip build
**When** archivo modificado → re-build
**Cache location**: `.bunstart/cache/`

### Requirement: Asset Pipeline

Pipeline de assets para frontend.

**When** copy assets → usa Bun.Glob
**When** process CSS → LightningCSS minification
**When** inject hashes → actualiza refs en HTML

## Discovery

- **package.json no compila**: Es source-only (exporta TS directo). No genera `dist/`.
- **Bun.directory() inestable**: Se usa `Bun.Glob` para listar archivos.

## Pending

1. Completar integración real de bun-plugin-dts en dts-emitter
2. Agregar script de build para compilar TS → JS y generar .d.ts
3. Implementar Sprint 6 (dev-server)

## Testing

```
bun test
# 146 pass, 0 fail
```