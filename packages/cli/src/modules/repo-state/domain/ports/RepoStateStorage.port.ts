import type { RepoState } from '../entities/RepoState';

/**
 * Port for loading and saving repo state (bunstart.config).
 * Implementations read/write the config file at the monorepo root.
 */
export interface RepoStateStoragePort {
	/**
	 * Loads repo state from the given directory (monorepo root).
	 * Returns null if config file is missing or invalid.
	 */
	load(cwd: string): Promise<RepoState | null>;

	/**
	 * Saves repo state to the given directory (monorepo root).
	 * Creates or overwrites the config file.
	 */
	save(cwd: string, state: RepoState): Promise<void>;
}
