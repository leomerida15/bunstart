import { ProcessAssetsUseCase } from '../../app/use-cases/ProcessAssetsUseCase';
import { FsAssetCopierAdapter } from '../adapters/FsAssetCopierAdapter';
import { LightningCssAdapter } from '../adapters/LightningCssAdapter';
import { HtmlInjectorAdapter } from '../adapters/HtmlInjectorAdapter';

/**
 * Factory for creating asset pipeline components.
 */
export class AssetPipelineFactory {
	public static createProcessAssetsUseCase(): ProcessAssetsUseCase {
		return new ProcessAssetsUseCase({
			copier: new FsAssetCopierAdapter(),
			cssProcessor: new LightningCssAdapter(),
			htmlInjector: new HtmlInjectorAdapter(),
		});
	}
}