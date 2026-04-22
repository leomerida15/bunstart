import type { BuildCache } from '../entities/BuildCache';

/**
 * Port for persisting and loading build cache.
 */
export interface CacheStoragePort {
	/**
	 * Loads the build cache for a package.
	 * @param packageName - Name of the package
	 * @returns The cached entries, or an empty cache if none exists
	 */
	load(packageName: string): Promise<BuildCache>;

	/**
	 * Saves the build cache for a package.
	 * @param packageName - Name of the package
	 * @param cache - The cache to persist
	 */
	save(packageName: string, cache: BuildCache): Promise<void>;

	/**
	 * Invalidates (deletes) the cache for a package.
	 * @param packageName - Name of the package
	 */
	invalidate(packageName: string): Promise<void>;
}