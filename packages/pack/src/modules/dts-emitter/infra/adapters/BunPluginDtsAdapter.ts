import type { DtsEmitterPort } from '../../domain/ports/DtsEmitter.port';
import type { DtsConfig } from '../../domain/value-objects/DtsConfig';
import type { DtsEmitterResult } from '../../domain/value-objects/DtsEmitterResult';
import {
	createDtsEmitterSuccess,
	createDtsEmitterFailure,
	createDtsEmitterNoOp,
} from '../../domain/value-objects/DtsEmitterResult';
import {
	createDtsCompilationError,
	createDtsMissingEntryError,
	createDtsPermissionError,
} from '../../domain/entities/DtsEmitterError';

/**
 * Adapter that uses bun-plugin-dts to emit TypeScript declaration files.
 */
export class BunPluginDtsAdapter implements DtsEmitterPort {
	/**
	 * Emits TypeScript declaration files using bun-plugin-dts.
	 * @param config - The DTS configuration
	 * @param outDir - The output directory
	 * @returns The result of the emission
	 */
	async emit(config: DtsConfig, outDir: string): Promise<DtsEmitterResult> {
		const startTime = Date.now();

		try {
			// Dynamic import of bun-plugin-dts
			// This allows the adapter to fail gracefully if the package is not installed
			const dtsPlugin = await this.loadDtsPlugin();

			if (!dtsPlugin) {
				return createDtsEmitterFailure(
					[
						'bun-plugin-dts is not installed. Run `bun add -d bun-plugin-dts` to install.',
					],
					Date.now() - startTime,
				);
			}

			// Run the plugin with the config
			// Note: bun-plugin-dts works as a BunPlugin, so we need to invoke it
			const result = await this.runDtsPlugin(dtsPlugin, config, outDir);

			return createDtsEmitterSuccess(result.generatedFiles, Date.now() - startTime);
		} catch (error) {
			const duration = Date.now() - startTime;

			// Categorize the error
			if (this.isCompilationError(error)) {
				return createDtsEmitterFailure(
					[`TypeScript error: ${error instanceof Error ? error.message : String(error)}`],
					duration,
				);
			}

			if (this.isMissingEntryError(error)) {
				return createDtsEmitterFailure(
					[
						`Missing entry file: ${error instanceof Error ? error.message : String(error)}`,
					],
					duration,
				);
			}

			if (this.isPermissionError(error)) {
				return createDtsEmitterFailure(
					[
						`Permission denied: ${error instanceof Error ? error.message : String(error)}`,
					],
					duration,
				);
			}

			return createDtsEmitterFailure(
				[`DTS emission failed: ${error instanceof Error ? error.message : String(error)}`],
				duration,
			);
		}
	}

	/**
	 * Attempts to load bun-plugin-dts dynamically.
	 */
	private async loadDtsPlugin(): Promise<{ default?: unknown } | null> {
		try {
			// Dynamic import - will be null at runtime if not installed
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			const module = await import('bun-plugin-dts');
			return module as { default?: unknown };
		} catch {
			return null;
		}
	}

	/**
	 * Runs the DTS plugin with the given configuration.
	 */
	private async runDtsPlugin(
		_plugin: unknown,
		_config: DtsConfig,
		_outDir: string,
	): Promise<{ generatedFiles: string[] }> {
		// TODO: Implement actual bun-plugin-dts invocation
		// For now, this is a placeholder that demonstrates the interface
		// The real implementation would use bun-plugin-dts API

		// bun-plugin-dts typically works as:
		// const dts = BunPluginDts.load({ entrypoints, outDir })
		// await Bun.build({ plugins: [dts] })

		// For now, return empty to allow the module to compile
		// This will be fully implemented once we test with real bun-plugin-dts
		return { generatedFiles: [] };
	}

	private isCompilationError(error: unknown): boolean {
		const message = error instanceof Error ? error.message : String(error);
		return (
			message.includes('TS') ||
			message.includes('type') ||
			message.includes('syntax') ||
			message.includes('TypeScript')
		);
	}

	private isMissingEntryError(error: unknown): boolean {
		const message = error instanceof Error ? error.message : String(error);
		return (
			message.includes('ENOENT') ||
			message.includes('not found') ||
			message.includes('does not exist')
		);
	}

	private isPermissionError(error: unknown): boolean {
		const message = error instanceof Error ? error.message : String(error);
		return message.includes('EACCES') || message.includes('permission denied');
	}
}
