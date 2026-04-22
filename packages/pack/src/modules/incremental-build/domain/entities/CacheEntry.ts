import type { ContentHash } from '../value-objects/ContentHash';

/**
 * Individual cache entry for a file.
 */
export interface CacheEntry {
	filePath: string;
	contentHash: ContentHash;
	timestamp: number;
}

/**
 * Creates a new CacheEntry.
 */
export function createCacheEntry(
	filePath: string,
	contentHash: ContentHash,
	timestamp: number = Date.now(),
): CacheEntry {
	return {
		filePath,
		contentHash,
		timestamp,
	};
}