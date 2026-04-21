import type { CacheStoragePort } from '../../domain/ports/CacheStorage.port';

/**
 * Use case that invalidates (deletes) the build cache for a package.
 */
export class InvalidateCacheUseCase {
	private readonly cacheStorage: CacheStoragePort;

	public constructor({ cacheStorage }: { cacheStorage: CacheStoragePort }) {
		this.cacheStorage = cacheStorage;
	}

	/**
	 * Invalidates the cache for a package, forcing a full rebuild next time.
	 * @param packageName - Name of the package
	 */
	async execute(packageName: string): Promise<void> {
		await this.cacheStorage.invalidate(packageName);
	}
}