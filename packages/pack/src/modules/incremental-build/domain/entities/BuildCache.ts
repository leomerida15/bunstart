import type { CacheEntry } from './CacheEntry';

/**
 * Aggregate representing the build cache for a single package.
 */
export class BuildCache {
	private readonly entries: Map<string, CacheEntry>;

	public constructor(entries: CacheEntry[] = []) {
		this.entries = new Map();
		for (const entry of entries) {
			this.entries.set(entry.filePath, entry);
		}
	}

	public add(entry: CacheEntry): void {
		this.entries.set(entry.filePath, entry);
	}

	public get(filePath: string): CacheEntry | undefined {
		return this.entries.get(filePath);
	}

	public has(filePath: string): boolean {
		return this.entries.has(filePath);
	}

	public getAll(): CacheEntry[] {
		return Array.from(this.entries.values());
	}

	public clear(): void {
		this.entries.clear();
	}

	public get size(): number {
		return this.entries.size;
	}
}