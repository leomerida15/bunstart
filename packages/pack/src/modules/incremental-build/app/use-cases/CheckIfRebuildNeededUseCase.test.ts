import { test, expect, describe, vi } from 'bun:test';
import { CheckIfRebuildNeededUseCase } from './CheckIfRebuildNeededUseCase';
import type { HashCalculatorPort } from '../../domain/ports/HashCalculator.port';
import type { CacheStoragePort } from '../../domain/ports/CacheStorage.port';
import { BuildCache } from '../../domain/entities/BuildCache';
import { ContentHash } from '../../domain/value-objects/ContentHash';
import { createCacheEntry } from '../../domain/entities/CacheEntry';

describe('CheckIfRebuildNeededUseCase', () => {
	describe('execute', () => {
		test('should return needsRebuild=true when no cache exists', async () => {
			const mockHashCalc: HashCalculatorPort = {
				hashFile: vi.fn().mockResolvedValue(
					ContentHash.unsafeFromString(
						'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
					),
				),
			};
			const mockCacheStorage: CacheStoragePort = {
				load: vi.fn().mockResolvedValue(new BuildCache()),
				save: vi.fn(),
				invalidate: vi.fn(),
			};

			const useCase = new CheckIfRebuildNeededUseCase({
				hashCalculator: mockHashCalc,
				cacheStorage: mockCacheStorage,
			});

			const result = await useCase.execute('my-package', ['./src/index.ts']);

			expect(result.needsRebuild).toBe(true);
			expect(result.changedFiles).toEqual(['./src/index.ts']);
		});

		test('should return needsRebuild=false when hashes match', async () => {
			const hash = ContentHash.unsafeFromString(
				'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
			);
			const mockHashCalc: HashCalculatorPort = {
				hashFile: vi.fn().mockResolvedValue(hash),
			};
			const cache = new BuildCache();
			cache.add(createCacheEntry('./src/index.ts', hash));
			const mockCacheStorage: CacheStoragePort = {
				load: vi.fn().mockResolvedValue(cache),
				save: vi.fn(),
				invalidate: vi.fn(),
			};

			const useCase = new CheckIfRebuildNeededUseCase({
				hashCalculator: mockHashCalc,
				cacheStorage: mockCacheStorage,
			});

			const result = await useCase.execute('my-package', ['./src/index.ts']);

			expect(result.needsRebuild).toBe(false);
			expect(result.changedFiles).toEqual([]);
		});
	});
});