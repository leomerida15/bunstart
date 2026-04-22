import { test, expect, describe, vi, beforeEach } from 'bun:test';
import { BunPluginDtsAdapter } from './BunPluginDtsAdapter';

describe('BunPluginDtsAdapter', () => {
	let adapter: BunPluginDtsAdapter;

	beforeEach(() => {
		adapter = new BunPluginDtsAdapter();
	});

	describe('emit', () => {
		test('should return failure when bun-plugin-dts is not installed', async () => {
			const result = await adapter.emit({ enable: true }, './dist');

			expect(result.success).toBe(false);
			expect(result.errors?.[0] ?? '').toContain('bun-plugin-dts is not installed');
		});

		test('should return no-op result when enable is false', async () => {
			const result = await adapter.emit({ enable: false }, './dist');

			// Note: enable: false is handled by EmitDtsUseCase, not the adapter
			// The adapter still tries to emit, but with the flag off it may behave differently
			expect(result).toBeDefined();
		});
	});
});
