import { test, expect, describe, beforeEach, afterEach } from 'bun:test';
import { DiskCacheAdapter } from './DiskCacheAdapter';
import { BuildCache } from '../../domain/entities/BuildCache';
import { createCacheEntry } from '../../domain/entities/CacheEntry';
import { ContentHash } from '../../domain/value-objects/ContentHash';

describe('DiskCacheAdapter', () => {
	const testCacheDir = '/tmp/bunstart-test-cache';
	let adapter: DiskCacheAdapter;

	beforeEach(async () => {
		// Clean up before each test
		try {
			await Bun.file(`${testCacheDir}/test-package.json`).delete();
		} catch {
			// File might not exist
		}
		adapter = new DiskCacheAdapter(testCacheDir);
	});

	afterEach(async () => {
		// Clean up after each test
		try {
			await Bun.file(`${testCacheDir}/test-package.json`).delete();
		} catch {
			// File might not exist
		}
	});

	describe('save and load', () => {
		test('should save and reload cache', async () => {
			const cache = new BuildCache();
			cache.add(
				createCacheEntry(
					'./src/index.ts',
					ContentHash.unsafeFromString(
						'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
					),
					1234567890,
				),
			);

			await adapter.save('test-package', cache);
			const loaded = await adapter.load('test-package');

			expect(loaded.size).toBe(1);
			expect(loaded.has('./src/index.ts')).toBe(true);
			const entry = loaded.get('./src/index.ts');
			expect(entry?.contentHash.value).toBe(
				'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
			);
			expect(entry?.timestamp).toBe(1234567890);
		});

		test('should return empty cache for missing package', async () => {
			const loaded = await adapter.load('nonexistent-package');
			expect(loaded.size).toBe(0);
		});
	});

	describe('invalidate', () => {
		test('should delete cache file', async () => {
			const cache = new BuildCache();
			cache.add(
				createCacheEntry(
					'./src/index.ts',
					ContentHash.unsafeFromString(
						'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
					),
				),
			);

			await adapter.save('test-package', cache);
			await adapter.invalidate('test-package');

			const loaded = await adapter.load('test-package');
			expect(loaded.size).toBe(0);
		});

		test('should not throw when invalidating non-existent package', async () => {
			await expect(
				adapter.invalidate('nonexistent-package'),
			).resolves.toBeUndefined();
		});
	});
});