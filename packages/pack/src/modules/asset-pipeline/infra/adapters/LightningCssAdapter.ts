import type { CssProcessorPort } from '../../domain/ports/CssProcessor.port';

/**
 * Adapter that processes CSS using LightningCSS.
 * Falls back gracefully if lightningcss is not installed.
 */
export class LightningCssAdapter implements CssProcessorPort {
	/**
	 * Processes a CSS file with minification and autoprefixer.
	 */
	async process(inputPath: string, outputPath: string): Promise<void> {
		try {
			// Try to use lightningcss
			const { transform } = await import('lightningcss');

			const input = Bun.file(inputPath);
			const css = await input.text();

			const result = transform({
				code: Buffer.from(css),
				minify: true,
				targets: {
					chrome: 90,
					firefox: 88,
					safari: 14,
				},
			});

			await Bun.write(outputPath, result.code.toString());
		} catch {
			// Fallback: just copy the file without processing
			const input = Bun.file(inputPath);
			const content = await input.arrayBuffer();
			await Bun.write(outputPath, content);
		}
	}
}

/**
 * Creates a CssProcessorPort based on availability.
 */
export function createCssProcessor(): CssProcessorPort {
	return new LightningCssAdapter();
}