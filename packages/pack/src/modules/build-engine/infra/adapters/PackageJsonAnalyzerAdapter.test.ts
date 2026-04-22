import { describe, it, expect, beforeEach } from 'bun:test';
import { PackageJsonAnalyzerAdapter } from './PackageJsonAnalyzerAdapter';
import { writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';

const TEST_DIR = '/tmp/pack-test-package-json';

describe('PackageJsonAnalyzerAdapter', () => {
	const adapter = new PackageJsonAnalyzerAdapter();

	beforeEach(async () => {
		try {
			await rm(TEST_DIR, { recursive: true, force: true });
		} catch {
			// ignore
		}
		await Bun.$`mkdir -p ${TEST_DIR}`;
	});

	it('loads a valid package.json', async () => {
		await writeFile(
			join(TEST_DIR, 'package.json'),
			JSON.stringify({
				name: '@bunstart/pack',
				version: '0.0.1',
				dependencies: { lodash: '^4.17.21' },
				devDependencies: { typescript: '^5.0.0' },
			}),
		);

		const result = await adapter.loadPackageJson(TEST_DIR);

		expect(result.name).toBe('@bunstart/pack');
		expect(result.version).toBe('0.0.1');
		expect(result.dependencies).toEqual({ lodash: '^4.17.21' });
		expect(result.devDependencies).toEqual({ typescript: '^5.0.0' });
	});

	it('returns empty deps when package.json is missing', async () => {
		const result = await adapter.loadPackageJson(TEST_DIR);

		expect(result.dependencies).toEqual({});
		expect(result.devDependencies).toEqual({});
	});

	it('returns empty deps when package.json is invalid JSON', async () => {
		await writeFile(join(TEST_DIR, 'package.json'), '{ invalid json }');

		const result = await adapter.loadPackageJson(TEST_DIR);

		expect(result.dependencies).toEqual({});
		expect(result.devDependencies).toEqual({});
	});
});
