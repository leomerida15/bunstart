import type { BuildCache } from '../entities/BuildCache';
import type { CacheEntry } from '../entities/CacheEntry';

/**
 * Service that compares current file hashes against cached hashes
 * to determine if a rebuild is needed.
 */
export class ChangeDetectionService {
	/**
	 * Compares current entries against cached entries and returns changed files.
	 * @param currentEntries - Current state of files with their hashes
	 * @param cachedCache - Previously cached state
	 * @returns Array of file paths that have changed
	 */
	public detectChanges(
		currentEntries: CacheEntry[],
		cachedCache: BuildCache,
	): string[] {
		const changedFiles: string[] = [];

		for (const current of currentEntries) {
			const cached = cachedCache.get(current.filePath);

			if (!cached) {
				// File not in cache = new file = rebuild
				changedFiles.push(current.filePath);
				continue;
			}

			if (!current.contentHash.equals(cached.contentHash)) {
				// Hash differs = file changed = rebuild
				changedFiles.push(current.filePath);
			}
		}

		// Also check for deleted files (in cache but not in current)
		const currentPaths = new Set(currentEntries.map((e) => e.filePath));
		for (const cached of cachedCache.getAll()) {
			if (!currentPaths.has(cached.filePath)) {
				changedFiles.push(cached.filePath);
			}
		}

		return changedFiles;
	}
}