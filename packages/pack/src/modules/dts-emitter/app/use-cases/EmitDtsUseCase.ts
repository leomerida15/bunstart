import type { DtsEmitterPort } from '../../domain/ports/DtsEmitter.port';
import type { DtsConfig } from '../../domain/value-objects/DtsConfig';
import type { DtsEmitterResult } from '../../domain/value-objects/DtsEmitterResult';
import { createDtsEmitterNoOp } from '../../domain/value-objects/DtsEmitterResult';
import { DtsEmitterError } from '../../domain/entities/DtsEmitterError';

/**
 * Use case that orchestrates the emission of TypeScript declaration files.
 */
export class EmitDtsUseCase {
	private readonly dtsEmitter: DtsEmitterPort;

	public constructor({ dtsEmitter }: { dtsEmitter: DtsEmitterPort }) {
		this.dtsEmitter = dtsEmitter;
	}

	/**
	 * Executes the DTS emission if enabled in the configuration.
	 * @param dtsConfig - The DTS configuration (may be undefined)
	 * @param outDir - The output directory for generated .d.ts files
	 * @returns The result of the emission, or a no-op result if disabled
	 */
	async execute(dtsConfig: DtsConfig | undefined, outDir: string): Promise<DtsEmitterResult> {
		if (!dtsConfig || !dtsConfig.enable) {
			return createDtsEmitterNoOp();
		}

		try {
			const result = await this.dtsEmitter.emit(dtsConfig, outDir);
			if (!result.success) {
				throw new DtsEmitterError(`DTS emission failed: ${result.errors.join('; ')}`);
			}
			return result;
		} catch (error) {
			if (error instanceof DtsEmitterError) {
				throw error;
			}
			throw new DtsEmitterError(
				`DTS emission failed: ${error instanceof Error ? error.message : String(error)}`,
				error,
			);
		}
	}
}
