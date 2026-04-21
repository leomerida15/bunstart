import { test, expect, describe } from 'bun:test';
import { ChangeDetectionService } from './ChangeDetectionService';
import { BuildCache } from '../entities/BuildCache';
import { createCacheEntry } from '../entities/CacheEntry';
import { ContentHash } from '../value-objects/ContentHash';

describe('ChangeDetectionService', () => {
	const service = new ChangeDetectionService();

	describe('detectChanges', () => {
		test('should return empty when hashes match', () => {
			const hash = ContentHash.unsafeFromString(
				'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
			);
			const current = [createCacheEntry('./src/index.ts', hash)];
			const cache = new BuildCache();
			cache.add(createCacheEntry('./src/index.ts', hash));

			const changes = service.detectChanges(current, cache);
			expect(changes).toEqual([]);
		});

		test('should detect changed files', () => {
			const hash1 = ContentHash.unsafeFromString(
				'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
			);
			const hash2 = ContentHash.unsafeFromString(
				'0000000000000000000000000000000000000000000000000000000000000000',
			);
			const current = [createCacheEntry('./src/index.ts', hash2)];
			const cache = new BuildCache();
			cache.add(createCacheEntry('./src/index.ts', hash1));

			const changes = service.detectChanges(current, cache);
			expect(changes).toEqual(['./src/index.ts']);
		});

		test('should detect new files', () => {
			const hash = ContentHash.unsafeFromString(
				'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
			);
			const current = [createCacheEntry('./src/new.ts', hash)];
			const cache = new BuildCache();

			const changes = service.detectChanges(current, cache);
			expect(changes).toEqual(['./src/new.ts']);
		});

		test('should detect deleted files', () => {
			const hash = ContentHash.unsafeFromString(
				'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
			);
			const current: ReturnType<typeof createCacheEntry>[] = [];
			const cache = new BuildCache();
			cache.add(createCacheEntry('./src/deleted.ts', hash));

			const changes = service.detectChanges(current, cache);
			expect(changes).toEqual(['./src/deleted.ts']);
		});
	});
});