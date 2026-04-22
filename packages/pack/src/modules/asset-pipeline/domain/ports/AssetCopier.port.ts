import type { Asset } from '../entities/Asset';

/**
 * Port for copying assets from source to destination.
 */
export interface AssetCopierPort {
	/**
	 * Copies an asset to the destination with hashed filename.
	 * @param asset - The asset to copy
	 * @param publicDir - Source directory
	 * @param outDir - Destination directory
	 * @returns The new path of the copied asset
	 */
	copy(asset: Asset, publicDir: string, outDir: string): Promise<string>;
}

/**
 * Configuration for the asset pipeline.
 */
export interface AssetsConfig {
	/** Directory containing public assets */
	publicDir?: string;
	/** HTML template to rewrite */
	htmlTemplate?: string;
	/** Whether to process CSS files */
	processCss?: boolean;
}

/**
 * Creates AssetsConfig with defaults.
 */
export function createAssetsConfig(
	config: Partial<AssetsConfig> | undefined,
): AssetsConfig | undefined {
	if (!config) return undefined;
	return {
		publicDir: config.publicDir ?? './public',
		htmlTemplate: config.htmlTemplate,
		processCss: config.processCss ?? true,
	};
}