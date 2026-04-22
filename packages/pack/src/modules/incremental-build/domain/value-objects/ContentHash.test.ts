import { test, expect, describe } from 'bun:test';
import { ContentHash } from './ContentHash';

describe('ContentHash', () => {
	describe('fromString', () => {
		test('should create valid hash from 64-char hex string', () => {
			const hash = ContentHash.fromString(
				'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
			);
			expect(hash.value).toBe(
				'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
			);
		});

		test('should throw for non-hex string', () => {
			expect(() => ContentHash.fromString('not-a-hash')).toThrow(
				'Invalid SHA-256 hash',
			);
		});

		test('should throw for short hex string', () => {
			expect(() => ContentHash.fromString('abc123')).toThrow(
				'Invalid SHA-256 hash',
			);
		});

		test('should throw for long hex string', () => {
			expect(() =>
				ContentHash.fromString(
					'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b85500',
				),
			).toThrow('Invalid SHA-256 hash');
		});
	});

	describe('equals', () => {
		test('should return true for same hash', () => {
			const hash1 = ContentHash.unsafeFromString(
				'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
			);
			const hash2 = ContentHash.unsafeFromString(
				'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
			);
			expect(hash1.equals(hash2)).toBe(true);
		});

		test('should return false for different hashes', () => {
			const hash1 = ContentHash.unsafeFromString(
				'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
			);
			const hash2 = ContentHash.unsafeFromString(
				'0000000000000000000000000000000000000000000000000000000000000000',
			);
			expect(hash1.equals(hash2)).toBe(false);
		});
	});

	describe('toString', () => {
		test('should return the hash value', () => {
			const hash = ContentHash.unsafeFromString(
				'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
			);
			expect(hash.toString()).toBe(
				'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
			);
		});
	});
});