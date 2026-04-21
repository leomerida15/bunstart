# @bunstart/pack - Roadmap General

Plan de desarrollo modular para convertir `@bunstart/pack` de un stub a un motor de construccion completo para el ecosistema Bunstart.

## Arquitectura

Cada sprint corresponde a un modulo con arquitectura hexagonal interna (domain/app/infra) siguiendo el mismo patron establecido en `@bunstart/cli`.

## Status General

| # | Sprint | Modulo | Descripcion | Status |
|---|--------|--------|-------------|--------|
| 1 | build-engine | `modules/build-engine/` | Core del build: `buildSetting()` API, `Bun.build` wrapper, smart externals, compilacion estructurada vs bundled | :large_blue_circle: por hacer |
| 2 | plugin-system | `modules/plugin-system/` | Sistema de plugins nativo BunPlugin, registro, resolucion, soporte CSS pipeline (SCSS, Tailwind, PostCSS) | :large_blue_circle: por hacer |
| 3 | dts-emitter | `modules/dts-emitter/` | Plugin interno #1: emision de `.d.ts` con `isolatedDeclarations: true` (TS 5.5+) | :large_blue_circle: por hacer |
| 4 | incremental-build | `modules/incremental-build/` | Content hashing SHA-256, deteccion de `dist/`, cache persistente en `.bunstart/cache` | :large_blue_circle: por hacer |
| 5 | asset-pipeline | `modules/asset-pipeline/` | Build frontend, assets publicos, hash injection en HTML, LightningCSS integration | :large_blue_circle: por hacer |
| 6 | dev-server | `modules/dev-server/` | Dev server on-demand con `Bun.serve`, HMR & Fast Refresh para React/Preact | :large_blue_circle: por hacer |

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
    └── Sprint 6 (dev-server) depende de 1 y 2         │
```

## Notas

- **Sprint 1 es critico**: todos los demas modulos dependen de el.
- **Sprints 2-3 son secuenciales**: el dts-emitter es el primer plugin, necesita el sistema de plugins.
- **Sprints 4, 5, 6 pueden paralelizarse** una vez completados Sprint 1 y 2.
- El **Reverse Dependency Graph** (feature #7 del contexto) pertenece al modulo `mono` del CLI, no a pack.
