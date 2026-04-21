# Design: sprint-05-asset-pipeline

## Technical Approach

```
modules/asset-pipeline/
├── domain/
│   ├── value-objects/AssetPath.ts
│   ├── entities/AssetManifest.ts
│   └── ports/
│       ├── AssetCopier.port.ts
│       ├── CssProcessor.port.ts
│       └── HtmlInjector.port.ts
├── app/
│   └── use-cases/
│       ├── CopyAssetsUseCase.ts
│       ├── ProcessCssUseCase.ts
│       └── InjectAssetHashesUseCase.ts
└── infra/
    └── adapters/
        ├── FsAssetCopierAdapter.ts       ← usa Bun.Glob
        ├── LightningCssAdapter.ts       ← wrapper lightningcss
        └── HtmlInjectorAdapter.ts         ← regex + replace
```

## Adapters

1. **FsAssetCopierAdapter**: Copia archivos de `public/` a `dist/` usando `Bun.Glob`
2. **LightningCssAdapter**: Wrapper de `lightningcss` para minificación
3. **HtmlInjectorAdapter**: Regex para injectar hashes en `<link>` y `<script>`

## Discovery

⚠️ **Bun.directory() no es estable**: Se usó `Bun.Glob` en su lugar. La API de directory puede cambiar.

## Tests

146 tests covering copy, processing, injection.