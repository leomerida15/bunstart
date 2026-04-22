/**
 * Asset type categorization.
 */
export type AssetType = 'image' | 'font' | 'stylesheet' | 'script' | 'other';

/**
 * Detects asset type from file extension.
 */
export function detectAssetType(filePath: string): AssetType {
	const ext = filePath.toLowerCase().split('.').pop() ?? '';

	// Images
	if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(ext)) {
		return 'image';
	}

	// Fonts
	if (['woff2', 'woff', 'ttf', 'otf', 'eot'].includes(ext)) {
		return 'font';
	}

	// Stylesheets
	if (['css'].includes(ext)) {
		return 'stylesheet';
	}

	// Scripts
	if (['js', 'mjs'].includes(ext)) {
		return 'script';
	}

	return 'other';
}