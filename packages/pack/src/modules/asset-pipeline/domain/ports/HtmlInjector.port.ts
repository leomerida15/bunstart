import type { HtmlManifest } from '../entities/HtmlManifest';

/**
 * Port for injecting asset hashes into HTML.
 */
export interface HtmlInjectorPort {
	/**
	 * Rewrites HTML src/href attributes using the manifest.
	 * @param html - Original HTML content
	 * @param manifest - Mapping of original paths to hashed paths
	 * @returns Rewritten HTML
	 */
	inject(html: string, manifest: HtmlManifest): string;
}