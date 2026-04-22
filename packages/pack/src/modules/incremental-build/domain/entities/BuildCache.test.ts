import { test, expect, describe } from 'bun:test';
import { BuildCache } from './BuildCache';
import { createCacheEntry } from './CacheEntry';
import { ContentHash } from '../value-objects/ContentHash';

describe('BuildCache', () => {
	describe('add', () => {
		test('should add an entry', () => {
			const cache = new BuildCache();
			const entry = createCacheEntry(
				'./src/index.ts',
				ContentHash.unsafeFromString(
					'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
				),
			);
			cache.add(entry);
			expect(cache.size).toBe(1);
			expect(cache.has('./src/index.ts')).toBe(true);
		});

		test('should replace existing entry with same path', () => {
			const cache = new BuildCache();
			const entry1 = createCacheEntry(
				'./src/index.ts',
				ContentHash.unsafeFromString(
					'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
				),
			);
			const entry2 = createCacheEntry(
				'./src/index.ts',
				ContentHash.unsafeFromString(
					'0000000000000000000000000000000000000000000000000000000000000000',
				),
			);
			cache.add(entry1);
			cache.add(entry2);
			expect(cache.size).toBe(1);
			expect(cache.get('./src/index.ts')?.contentHash.value).toBe(
				'0000000000000000000000000000000000000000000000000000000000000000',
			);
		});
	});

	describe('get', () => {
		test('should return entry for existing path', () => {
			const cache = new BuildCache();
			const entry = createCacheEntry(
				'./src/index.ts',
				ContentHash.unsafeFromString(
					'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
				),
			);
			cache.add(entry);
			expect(cache.get('./src/index.ts')).toBeDefined();
		});

		test('should return undefined for missing path', () => {
			const cache = new BuildCache();
			expect(cache.get('./src/missing.ts')).toBeUndefined();
		});
	});

	describe('getAll', () => {
		test('should return all entries', () => {
			const cache = new BuildCache();
			cache.add(
				createCacheEntry(
					'./src/a.ts',
					ContentHash.unsafeFromString(
						'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
					),
				),
			);
			cache.add(
				createCacheEntry(
					'./src/b.ts',
					ContentHash.unsafeFromString(
						'0000000000000000000000000000000000000000000000000000000000000000',
					),
				),
			);
			expect(cache.getAll()).toHaveLength(2);
		});
	});

	describe('clear', () => {
		test('should remove all entries', () => {
			const cache = new BuildCache();
			cache.add(
				createCacheEntry(
					'./src/index.ts',
					ContentHash.unsafeFromString(
						'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
					),
				),
			);
			cache.clear();
			expect(cache.size).toBe(0);
			expect(cache.getAll()).toHaveLength(0);
		});
	});
});