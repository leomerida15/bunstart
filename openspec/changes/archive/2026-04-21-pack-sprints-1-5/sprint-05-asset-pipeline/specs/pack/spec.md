# Spec: sprint-05-asset-pipeline

## Requirements

### Requirement: Asset Copy

Copiar assets a dist/.

**Given** archivos en public/
**When** FsAssetCopierAdapter.execute()
**Then** copia a dist/ manteniendo estructura

### Requirement: CSS Processing

Procesar CSS con LightningCSS.

**Given** archivos .css
**When** LightningCssAdapter.process()
**Then** retorna CSS minificado

### Requirement: Hash Injection

Inyectar hash en filenames de assets en HTML.

**Given** HTML con referencias a assets
**When** HtmlInjectorAdapter.inject()
**Then** reemplaza refs con hashes (e.g., style.css → style.a1b2c3.css)

### Requirement: Bun.Glob Usage

Usar Bun.Glob para listar archivos.

**Given** patrón de archivos
**When** busca archivos
**Then** usa Bun.Glob (Bun.directory() no estable)

## Scenarios

| ID | Scenario | Expected |
|----|----------|----------|
| 1 | Copiar imagen a dist/ | Copia correcta |
| 2 | Procesar CSS | CSS minificado |
| 3 | Inject hash en HTML | Refs actualizadas |
| 4 | Archivos sin cambios | Skip |