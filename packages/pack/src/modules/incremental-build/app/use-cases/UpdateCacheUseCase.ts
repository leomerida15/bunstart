import type { HashCalculatorPort } from '../../domain/ports/HashCalculator.port';
import type { CacheStoragePort } from '../../domain/ports/CacheStorage.port';
import { BuildCache } from '../../domain/entities/BuildCache';
import { createCacheEntry } from '../../domain/entities/CacheEntry';

/**
 * Use case that updates the build cache after a successful build.
 */
export class UpdateCacheUseCase {
	private readonly hashCalculator: HashCalculatorPort;
	private readonly cacheStorage: CacheStoragePort;

	public constructor({
		hashCalculator,
		cacheStorage,
	}: {
		hashCalculator: HashCalculatorPort;
		cacheStorage: CacheStoragePort;
	}) {
		this.hashCalculator = hashCalculator;
		this.cacheStorage = cacheStorage;
	}

	/**
	 * Computes hashes for all entrypoints and persists them to cache.
	 * @param packageName - Name of the package
	 * @param entrypoints - Files to cache
	 */
	async execute(packageName: string, entrypoints: string[]): Promise<void> {
		const cache = new BuildCache();

		for (const filePath of entrypoints) {
			const hash = await this.hashCalculator.hashFile(filePath);
			const entry = createCacheEntry(filePath, hash);
			cache.add(entry);
		}

		await this.cacheStorage.save(packageName, cache);
	}
}