import type { HtmlInjectorPort } from '../../domain/ports/HtmlInjector.port';
import type { HtmlManifest } from '../../domain/entities/HtmlManifest';

/**
 * Adapter that injects asset hashes into HTML using regex.
 */
export class HtmlInjectorAdapter implements HtmlInjectorPort {
	/**
	 * Rewrites HTML src/href attributes using the manifest.
	 */
	inject(html: string, manifest: HtmlManifest): string {
		let rewritten = html;

		// Replace src attributes for images, scripts
		rewritten = rewritten.replace(
			/(<img[^>]+src=["'])([^"']+)(["'])/gi,
			(match, prefix, src, suffix) => {
				const hashed = manifest[src];
				if (hashed) {
					return `${prefix}${hashed}${suffix}`;
				}
				return match;
			},
		);

		// Replace href attributes for links, stylesheets
		rewritten = rewritten.replace(
			/(<link[^>]+href=["'])([^"']+)(["'])/gi,
			(match, prefix, href, suffix) => {
				const hashed = manifest[href];
				if (hashed) {
					return `${prefix}${hashed}${suffix}`;
				}
				return match;
			},
		);

		// Also handle script src
		rewritten = rewritten.replace(
			/(<script[^>]+src=["'])([^"']+)(["'])/gi,
			(match, prefix, src, suffix) => {
				const hashed = manifest[src];
				if (hashed) {
					return `${prefix}${hashed}${suffix}`;
				}
				return match;
			},
		);

		return rewritten;
	}
}