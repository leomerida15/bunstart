import { test, expect, describe } from 'bun:test';
import { createDtsConfig } from './DtsConfig';

describe('DtsConfig', () => {
	describe('createDtsConfig', () => {
		test('should return undefined when config is undefined', () => {
			const result = createDtsConfig(undefined);
			expect(result).toBeUndefined();
		});

		test('should return config with enable false when not provided', () => {
			const result = createDtsConfig({});
			expect(result).toBeDefined();
			expect(result?.enable).toBe(false);
		});

		test('should use provided enable value', () => {
			const result = createDtsConfig({ enable: true });
			expect(result?.enable).toBe(true);
		});

		test('should default entrypoints to src/index.ts', () => {
			const result = createDtsConfig({ enable: true });
			expect(result?.entrypoints).toEqual(['./src/index.ts']);
		});

		test('should use provided entrypoints', () => {
			const result = createDtsConfig({
				enable: true,
				entrypoints: ['./src/index.ts', './src/utils.ts'],
			});
			expect(result?.entrypoints).toEqual(['./src/index.ts', './src/utils.ts']);
		});

		test('should use provided outDir', () => {
			const result = createDtsConfig({
				enable: true,
				outDir: './types',
			});
			expect(result?.outDir).toBe('./types');
		});

		test('should default outDir to undefined when not provided', () => {
			const result = createDtsConfig({ enable: true });
			expect(result?.outDir).toBeUndefined();
		});
	});
});
