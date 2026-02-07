import type { BunstartConfig } from '../entities/BunstartConfig';

/**
 * Port for loading and saving bunstart config (bunstart.config.ts).
 * Implementations read/write the config file at the monorepo root.
 */
export interface ConfigStoragePort {
	/**
	 * Loads the full config from the given directory (monorepo root).
	 * Returns null if no config file exists or if it cannot be read.
	 */
	load(cwd: string): Promise<BunstartConfig | null>;

	/**
	 * Saves the full config to the given directory (monorepo root).
	 * Creates or overwrites the config file.
	 */
	save(cwd: string, config: BunstartConfig): Promise<void>;
}
