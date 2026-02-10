import type { BunstartConfig } from '../../domain/entities/BunstartConfig';
import type { ConfigStoragePort } from '../../domain/ports/ConfigStorage.port';

export interface PatchConfigUseCaseProps {
	storage: ConfigStoragePort;
}

/**
 * Merges a partial config into the existing one (section-level replace).
 * Loads current config (or {} if missing), spreads partial over current, saves.
 * Modules must pass the complete section they own; sections are replaced entirely.
 */
export class PatchConfigUseCase {
	private readonly storage: ConfigStoragePort;

	constructor({ storage }: PatchConfigUseCaseProps) {
		this.storage = storage;
	}

	async execute(cwd: string, partial: Partial<BunstartConfig>): Promise<void> {
		const current = (await this.storage.load(cwd)) ?? {};
		const merged: BunstartConfig = { ...current, ...partial };
		await this.storage.save(cwd, merged);
	}
}
