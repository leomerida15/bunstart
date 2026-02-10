import { LoadConfigUseCase } from '../../app/use-cases/LoadConfigUseCase';
import { InitializeConfigUseCase } from '../../app/use-cases/InitializeConfigUseCase';
import { PatchConfigUseCase } from '../../app/use-cases/PatchConfigUseCase';
import { BunstartConfigFileAdapter } from '../adapters/BunstartConfigFileAdapter';

/**
 * Factory for config-state use cases with default adapter.
 */
export class ConfigUseCasesFactory {
	private static storage = new BunstartConfigFileAdapter();

	static createLoadConfigUseCase(): LoadConfigUseCase {
		return new LoadConfigUseCase({ storage: this.storage });
	}

	static createInitializeConfigUseCase(): InitializeConfigUseCase {
		return new InitializeConfigUseCase({ storage: this.storage });
	}

	static createPatchConfigUseCase(): PatchConfigUseCase {
		return new PatchConfigUseCase({ storage: this.storage });
	}
}
