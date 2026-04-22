import type { DtsConfig } from '../value-objects/DtsConfig';
import type { DtsEmitterResult } from '../value-objects/DtsEmitterResult';

/**
 * Port for emitting TypeScript declaration files.
 * Abstracts the underlying DTS generation mechanism.
 */
export interface DtsEmitterPort {
	/**
	 * Emits TypeScript declaration files based on the provided configuration.
	 * @param config - The DTS configuration
	 * @param outDir - The output directory for the generated .d.ts files
	 * @returns A result containing generated files, duration, and any errors
	 */
	emit(config: DtsConfig, outDir: string): Promise<DtsEmitterResult>;
}
