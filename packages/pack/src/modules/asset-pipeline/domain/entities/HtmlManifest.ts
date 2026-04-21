/**
 * HTML manifest mapping original asset paths to hashed paths.
 */
export interface HtmlManifest {
	/** Maps original src path to hashed path */
	[key: string]: string;
}

/**
 * Creates an empty HTML manifest.
 */
export function createHtmlManifest(): HtmlManifest {
	return {};
}

/**
 * Adds an entry to the manifest.
 */
export function addToManifest(
	manifest: HtmlManifest,
	originalPath: string,
	hashedPath: string,
): HtmlManifest {
	return {
		...manifest,
		[originalPath]: hashedPath,
	};
}