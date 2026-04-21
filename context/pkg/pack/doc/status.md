# @bunstart/pack - Roadmap General

Plan de desarrollo modular para convertir `@bunstart/pack` de un stub a un motor de construccion completo para el ecosistema Bunstart.

## Arquitectura

Cada sprint corresponde a un modulo con arquitectura hexagonal interna (domain/app/infra) siguiendo el mismo patron establecido en `@bunstart/cli`.

## Status General

| # | Sprint | Modulo | Descripcion | Status | Tests |
|---|--------|--------|-------------|--------|-------|
| 1 | build-engine | `modules/build-engine/` | Core del build: `buildSetting()` API, `Bun.build` wrapper, smart externals | :green_circle: completo | ~40 |
| 2 | plugin-system | `modules/plugin-system/` | Sistema de plugins nativo BunPlugin, registro, resolucion, PluginType | :green_circle: completo | 84 |
| 3 | dts-emitter | `modules/dts-emitter/` | Interfaz para .d.ts, delega a `bun-plugin-isolated-decl` | :green_circle: completo | 110 |
| 4 | incremental-build | `modules/incremental-build/` | Content hashing SHA-256, cache en `.bunstart/cache` | :green_circle: completo | 137 |
| 5 | asset-pipeline | `modules/asset-pipeline/` | Assets, hashing, LightningCSS, HTML injection | :green_circle: completo | 146 |
| 6 | dev-server | `modules/dev-server/` | Dev server `Bun.serve()`, file watcher, HMR | :green_circle: completo | 203 |
| 7 | plugin-docs | `doc/sprints/sprint-07-*.md` | Documentación de plugins externos | :green_circle: completo | N/A |

> **Tests actuales**: `bun test` en `packages/pack` → **203 pass, 0 fail**

## Dependencias entre Sprints

```
Sprint 1 (build-engine) ──────────────────────────────┐
    │                                                  │
    ├── Sprint 2 (plugin-system) depende de Sprint 1   │
    │       │                                          │
    │       └── Sprint 3 (dts-emitter) depende de 2    │
    │                                                  │
    ├── Sprint 4 (incremental-build) depende de 1      │
    │                                                  │
    ├── Sprint 5 (asset-pipeline) depende de 1 y 2     │
    │                                                  │
    ├── Sprint 6 (dev-server) depende de 1 y 2         │
    │                                                  │
    └── Sprint 7 (plugin-docs) NO tiene deps (docs)    │
```

** Roadmap COMPLETO ** ✅

## Pending

- Ninguno — todos los sprints completados!

## Decisiones de Arquitectura

- **dts-emitter delega a externo**: No generamos .d.ts internamente. Recomendamos usar `bun-plugin-isolated-decl` como plugin externo. Ver `sprint-03-dts-emitter.md`.

## Descubrimientos

- **Sprint 3**: Bun NO expone `isolatedDeclarations` como API pública. Usamos `bun-plugin-isolated-decl` que usa tsc directamente.
- **package.json source-only**: El paquete exporta TS directo desde `src/` — no hay step de compilación en `@bunstart/pack`.
- **Bun.Glob usado**: En asset-pipeline se usó `Bun.Glob` (API estable).
- **Sprint 7 docs-only**: Este sprint fue exclusivamente documentación — no se escribió código nuevo.
