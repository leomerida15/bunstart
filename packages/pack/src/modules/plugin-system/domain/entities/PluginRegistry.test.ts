import { test, expect, describe, beforeEach } from 'bun:test';
import { PluginRegistry } from './PluginRegistry';
import { PluginType } from '../value-objects/PluginType';
import { PluginPhase } from '../value-objects/PluginPhase';
import type { BunPlugin } from '../../../../shared/types/BunPlugin';

function createMockPlugin(
	name: string,
	phase: string,
	priority: number,
): {
	bunPlugin: BunPlugin;
	name: string;
	type: PluginType;
	phase: PluginPhase;
	priority: number;
} {
	return {
		bunPlugin: { name, hooks: { setup: () => {} } },
		name,
		type: PluginType.fromString('internal'),
		phase: PluginPhase.fromString(phase),
		priority,
	};
}

describe('PluginRegistry', () => {
	let registry: PluginRegistry;

	beforeEach(() => {
		registry = new PluginRegistry();
	});

	describe('add', () => {
		test('should add a plugin to the registry', () => {
			const plugin = createMockPlugin('test-plugin', 'build', 10);
			registry.add(plugin);
			expect(registry.get('test-plugin')).toBeDefined();
		});

		test('should replace existing plugin with same name', () => {
			const plugin1 = createMockPlugin('test-plugin', 'build', 10);
			const plugin2 = createMockPlugin('test-plugin', 'post-build', 20);

			registry.add(plugin1);
			registry.add(plugin2);

			const retrieved = registry.get('test-plugin');
			expect(retrieved?.phase.value).toBe('post-build');
			expect(retrieved?.priority).toBe(20);
		});
	});

	describe('get', () => {
		test('should return undefined for non-existent plugin', () => {
			expect(registry.get('non-existent')).toBeUndefined();
		});

		test('should return plugin by name', () => {
			const plugin = createMockPlugin('test-plugin', 'build', 10);
			registry.add(plugin);
			expect(registry.get('test-plugin')?.name).toBe('test-plugin');
		});
	});

	describe('getByPhase', () => {
		test('should return plugins filtered by phase', () => {
			registry.add(createMockPlugin('plugin1', 'pre-build', 10));
			registry.add(createMockPlugin('plugin2', 'build', 20));
			registry.add(createMockPlugin('plugin3', 'build', 5));

			const buildPlugins = registry.getByPhase(PluginPhase.fromString('build'));
			expect(buildPlugins).toHaveLength(2);
		});

		test('should return plugins sorted by priority ascending', () => {
			registry.add(createMockPlugin('plugin1', 'build', 100));
			registry.add(createMockPlugin('plugin2', 'build', 10));
			registry.add(createMockPlugin('plugin3', 'build', 50));

			const buildPlugins = registry.getByPhase(PluginPhase.fromString('build'));
			expect(buildPlugins[0]?.name).toBe('plugin2');
			expect(buildPlugins[1]?.name).toBe('plugin3');
			expect(buildPlugins[2]?.name).toBe('plugin1');
		});

		test('should return empty array for phase with no plugins', () => {
			registry.add(createMockPlugin('plugin1', 'build', 10));

			const preBuildPlugins = registry.getByPhase(PluginPhase.fromString('pre-build'));
			expect(preBuildPlugins).toHaveLength(0);
		});
	});

	describe('getAll', () => {
		test('should return all plugins', () => {
			registry.add(createMockPlugin('plugin1', 'build', 10));
			registry.add(createMockPlugin('plugin2', 'post-build', 20));

			const all = registry.getAll();
			expect(all).toHaveLength(2);
		});
	});

	describe('has', () => {
		test('should return true for existing plugin', () => {
			registry.add(createMockPlugin('test-plugin', 'build', 10));
			expect(registry.has('test-plugin')).toBe(true);
		});

		test('should return false for non-existent plugin', () => {
			expect(registry.has('non-existent')).toBe(false);
		});
	});

	describe('remove', () => {
		test('should remove a plugin', () => {
			registry.add(createMockPlugin('test-plugin', 'build', 10));
			expect(registry.remove('test-plugin')).toBe(true);
			expect(registry.get('test-plugin')).toBeUndefined();
		});

		test('should return false for non-existent plugin', () => {
			expect(registry.remove('non-existent')).toBe(false);
		});
	});

	describe('clear', () => {
		test('should remove all plugins', () => {
			registry.add(createMockPlugin('plugin1', 'build', 10));
			registry.add(createMockPlugin('plugin2', 'build', 20));
			registry.clear();
			expect(registry.getAll()).toHaveLength(0);
		});
	});
});
