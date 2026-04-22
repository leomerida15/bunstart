import type { AssetCopierPort } from '../../domain/ports/AssetCopier.port';
import type { CssProcessorPort } from '../../domain/ports/CssProcessor.port';
import type { HtmlInjectorPort } from '../../domain/ports/HtmlInjector.port';
import type { AssetsConfig } from '../../domain/ports/AssetCopier.port';
import type { Asset } from '../../domain/entities/Asset';
import type { HtmlManifest } from '../../domain/entities/HtmlManifest';
import { createHtmlManifest } from '../../domain/entities/HtmlManifest';
import { AssetHash } from '../../domain/value-objects/AssetHash';
import { detectAssetType } from '../../domain/value-objects/AssetType';

/**
 * Result of processing all assets.
 */
export interface ProcessAssetsResult {
	/** Processed assets */
	assets: Asset[];
	/** HTML manifest for hash injection */
	manifest: HtmlManifest;
	/** Error messages if any */
	errors: string[];
}

/**
 * Use case that processes all assets: copies files, processes CSS, generates manifest.
 */
export class ProcessAssetsUseCase {
	private readonly copier: AssetCopierPort;
	private readonly cssProcessor: CssProcessorPort;
	private readonly htmlInjector: HtmlInjectorPort;

	public constructor({
		copier,
		cssProcessor,
		htmlInjector,
	}: {
		copier: AssetCopierPort;
		cssProcessor: CssProcessorPort;
		htmlInjector: HtmlInjectorPort;
	}) {
		this.copier = copier;
		this.cssProcessor = cssProcessor;
		this.htmlInjector = htmlInjector;
	}

	/**
	 * Executes the asset pipeline.
	 * @param config - Asset pipeline configuration
	 * @param outDir - Output directory for built files
	 * @returns Result with processed assets and manifest
	 */
	async execute(
		config: AssetsConfig,
		outDir: string,
	): Promise<ProcessAssetsResult> {
		const { publicDir, htmlTemplate, processCss } = config;
		const manifest = createHtmlManifest();
		const assets: Asset[] = [];
		const errors: string[] = [];

		// Check if publicDir exists
		const publicDirPath = publicDir ?? './public';
		const publicDirFile = Bun.file(publicDirPath);
		const exists = await publicDirFile.exists();

		if (!exists) {
			return { assets, manifest, errors };
		}

		// Get all files in public directory using glob
		const publicFolder = new Bun.Glob('*').scanSync(publicDirPath) ?? [];

		for (const fileName of publicFolder) {
			try {
				const type = detectAssetType(fileName);

				// Process CSS if enabled
				if (processCss && type === 'stylesheet') {
					const cssOutput = `${outDir}/public/${fileName}`;
					await this.cssProcessor.process(
						`${publicDirPath}/${fileName}`,
						cssOutput,
					);
					continue;
				}

				// Copy other assets
				const asset: Asset = {
					sourcePath: `${publicDirPath}/${fileName}`,
					outputPath: fileName,
					type,
				};

				const newPath = await this.copier.copy(
					asset,
					publicDirPath,
					`${outDir}/public`,
				);

				// Add to manifest
				const originalPath = `/${fileName}`;
				const hashedPath = `/${newPath}`;
				manifest[originalPath] = hashedPath;

				assets.push(asset);
			} catch (error) {
				errors.push(
					`Failed to process ${fileName}: ${
						error instanceof Error ? error.message : String(error)
					}`,
				);
			}
		}

		// Process HTML if template is provided
		if (htmlTemplate) {
			const htmlFile = Bun.file(htmlTemplate);
			const htmlExists = await htmlFile.exists();

			if (htmlExists) {
				const html = await htmlFile.text();
				const rewritten = this.htmlInjector.inject(html, manifest);
				await Bun.write(`${outDir}/${htmlTemplate}`, rewritten);
			}
		}

		return { assets, manifest, errors };
	}
}