import { EmitDtsUseCase } from '../../app/use-cases/EmitDtsUseCase';
import { BunPluginDtsAdapter } from '../adapters/BunPluginDtsAdapter';

/**
 * Factory for creating DTS emitter components.
 */
export class DtsEmitterFactory {
	private static instance: EmitDtsUseCase | null = null;

	/**
	 * Gets the EmitDtsUseCase singleton with injected dependencies.
	 */
	public static getEmitDtsUseCase(): EmitDtsUseCase {
		if (!this.instance) {
			const adapter = new BunPluginDtsAdapter();
			this.instance = new EmitDtsUseCase({ dtsEmitter: adapter });
		}
		return this.instance;
	}

	/**
	 * Creates a new EmitDtsUseCase instance (for testing).
	 */
	public static createEmitDtsUseCase(adapter: BunPluginDtsAdapter): EmitDtsUseCase {
		return new EmitDtsUseCase({ dtsEmitter: adapter });
	}
}
