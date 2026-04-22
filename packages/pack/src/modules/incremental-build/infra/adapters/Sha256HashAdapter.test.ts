import { test, expect, describe, beforeEach, afterEach } from 'bun:test';
import { Sha256HashAdapter } from './Sha256HashAdapter';
import { ContentHash } from '../../domain/value-objects/ContentHash';

describe('Sha256HashAdapter', () => {
	const testFilePath = '/tmp/bunstart-test-hash-file.txt';
	let adapter: Sha256HashAdapter;

	beforeEach(async () => {
		adapter = new Sha256HashAdapter();
		await Bun.write(testFilePath, 'hello world');
	});

	afterEach(async () => {
		try {
			await Bun.file(testFilePath).delete();
		} catch {
			// File might not exist
		}
	});

	describe('hashFile', () => {
		test('should return consistent hash for same content', async () => {
			const hash1 = await adapter.hashFile(testFilePath);
			const hash2 = await adapter.hashFile(testFilePath);
			expect(hash1.equals(hash2)).toBe(true);
		});

		test('should return different hash for different content', async () => {
			const hash1 = await adapter.hashFile(testFilePath);
			await Bun.write(testFilePath, 'different content');
			const hash2 = await adapter.hashFile(testFilePath);
			expect(hash1.equals(hash2)).toBe(false);
		});

		test('should return valid SHA-256 hash', async () => {
			const hash = await adapter.hashFile(testFilePath);
			expect(hash.value).toMatch(/^[a-f0-9]{64}$/i);
		});

		test('should match known SHA-256 hash for hello world', async () => {
			await Bun.write(testFilePath, 'hello world');
			const hash = await adapter.hashFile(testFilePath);
			// Known SHA-256 for "hello world" (without newline)
			expect(hash.value).toBe(
				'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9',
			);
		});
	});
});