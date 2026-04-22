# Proposal: sprint-05-asset-pipeline

## Summary

Build frontend: assets públicos, hashing, LightningCSS integration, HTML injection con hash de assets.

## Intent

- **Why**: Soporte para assets estáticos y CSS en frontend.
- **Scope**: Asset pipeline completo.
- **Approach**: TDD - 146 tests.

## Domain

`@bunstart/pack` - Build engine para Bunstart.

## Dependencies

- Depende de: Sprint 1 (build-engine), Sprint 2 (plugin-system)

## Acceptance Criteria

- [x] FsAssetCopierAdapter - copia assets
- [x] LightningCssAdapter - procesa CSS
- [x] HtmlInjectorAdapter - inyecta hashes en HTML
- [x] 146 tests passing