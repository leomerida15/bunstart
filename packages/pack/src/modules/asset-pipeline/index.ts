// Domain exports
export type { Asset } from './domain/entities/Asset';
export { createAsset } from './domain/entities/Asset';

export type { HtmlManifest } from './domain/entities/HtmlManifest';
export { createHtmlManifest, addToManifest } from './domain/entities/HtmlManifest';

export type { AssetType } from './domain/value-objects/AssetType';
export { detectAssetType } from './domain/value-objects/AssetType';

export { AssetHash } from './domain/value-objects/AssetHash';

export type {
	AssetCopierPort,
	AssetsConfig,
} from './domain/ports/AssetCopier.port';
export { createAssetsConfig } from './domain/ports/AssetCopier.port';

export type { CssProcessorPort } from './domain/ports/CssProcessor.port';
export type { HtmlInjectorPort } from './domain/ports/HtmlInjector.port';

// Application exports
export type { ProcessAssetsResult } from './app/use-cases/ProcessAssetsUseCase';
export { ProcessAssetsUseCase } from './app/use-cases/ProcessAssetsUseCase';

// Infrastructure exports
export { FsAssetCopierAdapter } from './infra/adapters/FsAssetCopierAdapter';
export { LightningCssAdapter, createCssProcessor } from './infra/adapters/LightningCssAdapter';
export { HtmlInjectorAdapter } from './infra/adapters/HtmlInjectorAdapter';
export { AssetPipelineFactory } from './infra/factories/AssetPipelineFactory';