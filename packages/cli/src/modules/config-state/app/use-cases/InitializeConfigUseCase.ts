import type { BunstartConfig } from '../../domain/entities/BunstartConfig';
import type { ConfigStoragePort } from '../../domain/ports/ConfigStorage.port';

export interface InitializeConfigUseCaseProps {
	storage: ConfigStoragePort;
}

/**
 * Writes a new config file (bunstart.config.ts) at the monorepo root.
 * Used once when buns init bootstraps a new monorepo. Overwrites any existing file.
 */
export class InitializeConfigUseCase {
	private readonly storage: ConfigStoragePort;

	constructor({ storage }: InitializeConfigUseCaseProps) {
		this.storage = storage;
	}

	async execute(cwd: string, config: BunstartConfig): Promise<void> {
		await this.storage.save(cwd, config);
	}
}
