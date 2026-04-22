# Sprint 5: asset-pipeline

## Context

Pipeline de assets para builds frontend. Maneja la copia de assets publicos (imagenes, fuentes), inyeccion de hashes en HTML para cache-busting, y procesamiento CSS ultra-rapido via LightningCSS (reemplazo de PostCSS/CssNano escrito en Rust). Soporta la carpeta `public/` con rutas relativas robustas.

## Dependencies

- **Depende de**: Sprint 1 (build-engine), Sprint 2 (plugin-system) - LightningCSS se integra como procesador de CSS via el sistema de plugins.
- **Dependientes**: Ninguno.

## Estructura del Modulo

```
modules/asset-pipeline/
├── domain/
│   ├── entities/
│   │   ├── Asset.ts                  # Archivo asset (imagen, fuente, CSS, etc.)
│   │   ├── HtmlManifest.ts           # Mapa de assets originales -> hasheados
│   │   └── ProcessedStylesheet.ts    # CSS procesado con metadata
│   ├── value-objects/
│   │   ├── AssetHash.ts              # Hash corto para cache-busting (8 chars)
│   │   ├── PublicPath.ts             # Ruta publica validada
│   │   └── AssetType.ts             # "image" | "font" | "stylesheet" | "script"
│   ├── ports/
│   │   ├── CssProcessor.port.ts     # Interface para procesar CSS (LightningCSS o PostCSS)
│   │   ├── HtmlInjector.port.ts     # Interface para inyectar hashes en HTML
│   │   ├── AssetCopier.port.ts      # Interface para copiar assets a dist/public
│   │   └── AssetHasher.port.ts      # Interface para hashear nombre de assets
│   └── services/
│       ├── AssetManifestBuilder.ts   # Construye el manifiesto original -> hasheado
│       └── PublicPathResolver.ts     # Resuelve rutas relativas para assets
├── app/
│   └── use-cases/
│       ├── ProcessAssetsUseCase.ts        # Orquesta copia + hash + manifest
│       ├── ProcessStylesheetsUseCase.ts   # Procesa CSS con LightningCSS
│       └── InjectHtmlHashesUseCase.ts     # Reescribe HTML con hashes de assets
├── infra/
│   ├── adapters/
│   │   ├── LightningCssAdapter.ts       # Implementa CssProcessorPort con lightningcss
│   │   ├── PostCssAdapter.ts            # Fallback: CssProcessorPort con PostCSS
│   │   ├── BunHtmlRewriterAdapter.ts    # Implementa HtmlInjectorPort
│   │   ├── FsAssetCopierAdapter.ts      # Implementa AssetCopierPort
│   │   └── ContentAssetHasherAdapter.ts # Implementa AssetHasherPort (hash de contenido)
│   └── factories/
│       └── AssetPipelineFactory.ts
└── index.ts
```

## Pasos a Ejecutar

### Paso 1: Domain Layer
- [ ] Definir `Asset` entity (sourcePath, outputPath, type, hash)
- [ ] Definir `HtmlManifest` entity (mapa de rutas)
- [ ] Definir `ProcessedStylesheet` entity
- [ ] Implementar `AssetHash` VO (8 chars hash)
- [ ] Implementar `PublicPath` VO
- [ ] Implementar `AssetType` VO
- [ ] Definir `CssProcessorPort` interface
- [ ] Definir `HtmlInjectorPort` interface
- [ ] Definir `AssetCopierPort` interface
- [ ] Definir `AssetHasherPort` interface
- [ ] Implementar `AssetManifestBuilder` domain service
- [ ] Implementar `PublicPathResolver` domain service

### Paso 2: Application Layer
- [ ] Implementar `ProcessAssetsUseCase` - copia, hashea, genera manifest
- [ ] Implementar `ProcessStylesheetsUseCase` - procesa CSS (minify, autoprefix)
- [ ] Implementar `InjectHtmlHashesUseCase` - reescribe HTML con rutas hasheadas

### Paso 3: Infrastructure Layer
- [ ] Implementar `LightningCssAdapter` (usa `lightningcss` npm)
- [ ] Implementar `PostCssAdapter` (fallback para proyectos con PostCSS existente)
- [ ] Implementar `BunHtmlRewriterAdapter` (usa HTMLRewriter de Bun si disponible)
- [ ] Implementar `FsAssetCopierAdapter` (copia archivos de public/ a dist/)
- [ ] Implementar `ContentAssetHasherAdapter`
- [ ] Implementar `AssetPipelineFactory`

### Paso 4: Integracion
- [ ] Integrar como post-build step en build-engine
- [ ] Exponer opciones `assets: { publicDir, htmlTemplate }` en `buildSetting()`
- [ ] Registrar LightningCSS como plugin via plugin-system (si aplica)
- [ ] Documentar API con JSDoc

### Paso 5: Tests
- [ ] Tests unitarios para AssetManifestBuilder
- [ ] Tests unitarios para PublicPathResolver
- [ ] Test de integracion: copiar assets + generar manifest
- [ ] Test de integracion: procesar CSS con LightningCSS
- [ ] Test E2E: build frontend React con assets hasheados en HTML

## Status

- [ ] Paso 1: Domain Layer
- [ ] Paso 2: Application Layer
- [ ] Paso 3: Infrastructure Layer
- [ ] Paso 4: Integracion
- [ ] Paso 5: Tests
