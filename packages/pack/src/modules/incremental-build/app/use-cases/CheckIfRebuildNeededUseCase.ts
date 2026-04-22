import type { HashCalculatorPort } from '../../domain/ports/HashCalculator.port';
import type { CacheStoragePort } from '../../domain/ports/CacheStorage.port';
import { ChangeDetectionService } from '../../domain/services/ChangeDetectionService';
import { createCacheEntry } from '../../domain/entities/CacheEntry';
import type { ContentHash } from '../../domain/value-objects/ContentHash';

/**
 * Result of checking whether a rebuild is needed.
 */
export interface RebuildCheckResult {
	needsRebuild: boolean;
	changedFiles: string[];
}

/**
 * Use case that determines if a rebuild is necessary by comparing
 * current file hashes against cached hashes.
 */
export class CheckIfRebuildNeededUseCase {
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
	 * Checks if a rebuild is needed for the given entrypoints.
	 * @param packageName - Name of the package being built
	 * @param entrypoints - Array of file paths to check
	 * @returns Result indicating whether rebuild is needed
	 */
	async execute(
		packageName: string,
		entrypoints: string[],
	): Promise<RebuildCheckResult> {
		// Load cached state
		const cachedCache = await this.cacheStorage.load(packageName);

		// Compute current hashes
		const currentEntries = await Promise.all(
			entrypoints.map(async (filePath) => {
				const hash = await this.hashCalculator.hashFile(filePath);
				return createCacheEntry(filePath, hash);
			}),
		);

		// Detect changes
		const changeDetector = new ChangeDetectionService();
		const changedFiles = changeDetector.detectChanges(currentEntries, cachedCache);

		return {
			needsRebuild: changedFiles.length > 0,
			changedFiles,
		};
	}
}