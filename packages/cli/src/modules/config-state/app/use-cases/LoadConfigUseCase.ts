import type { BunstartConfig } from '../../domain/entities/BunstartConfig';
import type { ConfigStoragePort } from '../../domain/ports/ConfigStorage.port';

export interface LoadConfigUseCaseProps {
	storage: ConfigStoragePort;
}

/**
 * Loads full config from the monorepo root (bunstart.config.ts).
 * Returns null if config file is missing or invalid.
 */
export class LoadConfigUseCase {
	private readonly storage: ConfigStoragePort;

	constructor({ storage }: LoadConfigUseCaseProps) {
		this.storage = storage;
	}

	async execute(cwd: string): Promise<BunstartConfig | null> {
		return this.storage.load(cwd);
	}
}
