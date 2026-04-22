import { test, expect, describe, beforeEach } from 'bun:test';
import { PluginValidator } from './PluginValidator';
import type { BunPlugin } from '../../../../shared/types/BunPlugin';

describe('PluginValidator', () => {
	let validator: PluginValidator;

	beforeEach(() => {
		validator = new PluginValidator();
	});

	describe('validate', () => {
		test('should pass for valid plugin', () => {
			const plugin: BunPlugin = {
				name: 'test-plugin',
				hooks: { setup: () => {} },
			};
			expect(() => validator.validate(plugin)).not.toThrow();
		});

		test('should pass for plugin with build hook', () => {
			const plugin: BunPlugin = {
				name: 'test-plugin',
				hooks: { build: () => {} },
			};
			expect(() => validator.validate(plugin)).not.toThrow();
		});

		test('should throw for undefined plugin', () => {
			expect(() => validator.validate(undefined as never)).toThrow(
				'Plugin is undefined or null',
			);
		});

		test('should throw for null plugin', () => {
			expect(() => validator.validate(null as never)).toThrow('Plugin is undefined or null');
		});

		test('should throw for plugin without name', () => {
			const plugin = { name: undefined, hooks: { setup: () => {} } } as unknown as BunPlugin;
			expect(() => validator.validate(plugin)).toThrow('Plugin must have a non-empty name');
		});

		test('should throw for plugin with empty name', () => {
			const plugin: BunPlugin = { name: '', hooks: { setup: () => {} } };
			expect(() => validator.validate(plugin)).toThrow('Plugin must have a non-empty name');
		});

		test('should throw for plugin without hooks', () => {
			const plugin: BunPlugin = { name: 'test-plugin' };
			expect(() => validator.validate(plugin)).toThrow(
				'Plugin "test-plugin" must have hooks defined',
			);
		});

		test('should throw for plugin with undefined hooks', () => {
			const plugin: BunPlugin = { name: 'test-plugin', hooks: undefined };
			expect(() => validator.validate(plugin)).toThrow(
				'Plugin "test-plugin" must have hooks defined',
			);
		});
	});

	describe('isValid', () => {
		test('should return true for valid plugin', () => {
			const plugin: BunPlugin = {
				name: 'test-plugin',
				hooks: { setup: () => {} },
			};
			expect(validator.isValid(plugin)).toBe(true);
		});

		test('should return false for invalid plugin', () => {
			const plugin: BunPlugin = { name: 'test-plugin' };
			expect(validator.isValid(plugin)).toBe(false);
		});
	});
});
