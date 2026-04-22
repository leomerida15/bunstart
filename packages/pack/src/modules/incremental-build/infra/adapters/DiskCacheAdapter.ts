import type { CacheStoragePort } from '../../domain/ports/CacheStorage.port';
import { BuildCache } from '../../domain/entities/BuildCache';
import type { CacheEntry } from '../../domain/entities/CacheEntry';
import { ContentHash } from '../../domain/value-objects/ContentHash';
import { createCacheEntry } from '../../domain/entities/CacheEntry';

/**
 * Adapter that persists build cache as JSON files on disk.
 * Cache files are stored in `.bunstart/cache/{package-name}.json`.
 */
export class DiskCacheAdapter implements CacheStoragePort {
	private readonly cacheDir: string;

	public constructor(cacheDir: string = '.bunstart/cache') {
		this.cacheDir = cacheDir;
	}

	async load(packageName: string): Promise<BuildCache> {
		try {
			const filePath = `${this.cacheDir}/${packageName}.json`;
			const file = Bun.file(filePath);
			const exists = await file.exists();

			if (!exists) {
				return new BuildCache();
			}

			const content = await file.text();
			const data = JSON.parse(content) as {
				entries: Array<{ filePath: string; contentHash: string; timestamp: number }>;
			};

			const entries: CacheEntry[] = data.entries.map((e) =>
				createCacheEntry(e.filePath, ContentHash.unsafeFromString(e.contentHash), e.timestamp),
			);

			return new BuildCache(entries);
		} catch {
			// If anything goes wrong, return empty cache
			return new BuildCache();
		}
	}

	async save(packageName: string, cache: BuildCache): Promise<void> {
		const entries = cache.getAll().map((entry) => ({
			filePath: entry.filePath,
			contentHash: entry.contentHash.value,
			timestamp: entry.timestamp,
		}));

		const data = { entries };

		// Ensure cache directory exists
		await this.ensureDir(this.cacheDir);

		const filePath = `${this.cacheDir}/${packageName}.json`;
		await Bun.write(filePath, JSON.stringify(data, null, 2));
	}

	async invalidate(packageName: string): Promise<void> {
		try {
			const filePath = `${this.cacheDir}/${packageName}.json`;
			await Bun.file(filePath).delete();
		} catch {
			// File might not exist — that's fine
		}
	}

	private async ensureDir(dir: string): Promise<void> {
		try {
			// Check if directory exists by trying to read it
			await Bun.file(dir).stream();
		} catch {
			// Directory doesn't exist, we need to create it
			// Bun doesn't have a mkdir API, so we use a workaround
			await Bun.write(`${dir}/.gitkeep`, '');
			await Bun.file(`${dir}/.gitkeep`).delete();
		}
	}
}