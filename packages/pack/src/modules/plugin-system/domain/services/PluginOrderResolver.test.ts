import { test, expect, describe } from 'bun:test';
import { PluginOrderResolver } from './PluginOrderResolver';
import { PluginType } from '../value-objects/PluginType';
import { PluginPhase } from '../value-objects/PluginPhase';
import type { PluginDefinition } from '../entities/PluginDefinition';
import type { BunPlugin } from '../../../../shared/types/BunPlugin';

function createMockDefinition(name: string, phase: string, priority: number): PluginDefinition {
	return {
		bunPlugin: { name, hooks: {} } as BunPlugin,
		name,
		type: PluginType.fromString('internal'),
		phase: PluginPhase.fromString(phase),
		priority,
	};
}

describe('PluginOrderResolver', () => {
	describe('sort', () => {
		test('should sort plugins by priority ascending', () => {
			const plugins = [
				createMockDefinition('p1', 'build', 100),
				createMockDefinition('p2', 'build', 10),
				createMockDefinition('p3', 'build', 50),
			];

			const sorted = new PluginOrderResolver().sort(plugins);

			expect(sorted[0]?.name).toBe('p2');
			expect(sorted[1]?.name).toBe('p3');
			expect(sorted[2]?.name).toBe('p1');
		});

		test('should not modify original array', () => {
			const plugins = [
				createMockDefinition('p1', 'build', 100),
				createMockDefinition('p2', 'build', 10),
			];

			new PluginOrderResolver().sort(plugins);

			expect(plugins[0]?.name).toBe('p1');
			expect(plugins[1]?.name).toBe('p2');
		});

		test('should handle empty array', () => {
			const sorted = new PluginOrderResolver().sort([]);
			expect(sorted).toHaveLength(0);
		});

		test('should handle single plugin', () => {
			const plugins = [createMockDefinition('p1', 'build', 10)];
			const sorted = new PluginOrderResolver().sort(plugins);
			expect(sorted).toHaveLength(1);
			expect(sorted[0]?.name).toBe('p1');
		});
	});

	describe('sortDesc', () => {
		test('should sort plugins by priority descending', () => {
			const plugins = [
				createMockDefinition('p1', 'build', 100),
				createMockDefinition('p2', 'build', 10),
				createMockDefinition('p3', 'build', 50),
			];

			const sorted = new PluginOrderResolver().sortDesc(plugins);

			expect(sorted[0]?.name).toBe('p1');
			expect(sorted[1]?.name).toBe('p3');
			expect(sorted[2]?.name).toBe('p2');
		});
	});
});
