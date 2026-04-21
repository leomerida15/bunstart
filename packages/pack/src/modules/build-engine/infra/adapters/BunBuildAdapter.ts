import type { BundlerPort } from '../../domain/ports/Bundler.port';
import type { BuildConfig } from '../../domain/entities/BuildConfig';
import type { BuildResult } from '../../domain/entities/BuildResult';
import { BuildError } from '../../../../shared/errors/BuildError';

/**
 * Adapter that implements BundlerPort using Bun.build().
 */
export class BunBuildAdapter implements BundlerPort {
	async execute(config: BuildConfig): Promise<BuildResult> {
		const start = Date.now();

		try {
			const outputs = await Bun.build({
				entrypoints: config.entrypoints.map((e) => e.resolvedPath),
				outdir: config.outdir,
				target: 'bun',
				format: config.outputFormat.value as 'esm' | 'cjs' | 'iife',
				external: config.externals,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				plugins: config.plugins as any,
				minify: config.minify,
				sourcemap: config.sourcemap,
			});

			return {
				success: outputs.success,
				outputs: outputs.outputs.map((o) => ({
					path: o.path,
					size: o.size,
				})),
				errors: [],
				durationMs: Date.now() - start,
			};
		} catch (err) {
			return {
				success: false,
				outputs: [],
				errors: [new BuildError(String(err), err)],
				durationMs: Date.now() - start,
			};
		}
	}
}
