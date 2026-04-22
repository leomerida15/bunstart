import type { AssetType } from '../value-objects/AssetType';

/**
 * Asset entity representing a file to be processed in the asset pipeline.
 */
export interface Asset {
	/** Original source path relative to project root */
	sourcePath: string;
	/** Output path relative to dist directory */
	outputPath: string;
	/** Type of asset (image, font, etc.) */
	type: AssetType;
	/** Short hash for cache-busting (8 chars) */
	hash?: string;
}

/**
 * Creates an Asset from a source path.
 */
export function createAsset(
	sourcePath: string,
	outputPath: string,
	type: AssetType,
): Asset {
	return {
		sourcePath,
		outputPath,
		type,
	};
}