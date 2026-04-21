import { test, expect, describe } from 'bun:test';
import { PluginType } from './PluginType';

describe('PluginType', () => {
	describe('fromString', () => {
		test('should create a valid internal type', () => {
			const type = PluginType.fromString('internal');
			expect(type.value).toBe('internal');
		});

		test('should create a valid external type', () => {
			const type = PluginType.fromString('external');
			expect(type.value).toBe('external');
		});

		test('should create a valid dts type', () => {
			const type = PluginType.fromString('dts');
			expect(type.value).toBe('dts');
		});

		test('should throw for invalid type', () => {
			expect(() => PluginType.fromString('invalid')).toThrow(
				'Invalid plugin type: invalid. Valid values are "internal", "external", or "dts".',
			);
		});

		test('should throw for empty string', () => {
			expect(() => PluginType.fromString('')).toThrow();
		});
	});

	describe('equals', () => {
		test('should return true for same value', () => {
			const type1 = PluginType.fromString('internal');
			const type2 = PluginType.fromString('internal');
			expect(type1.equals(type2)).toBe(true);
		});

		test('should return false for different values', () => {
			const type1 = PluginType.fromString('internal');
			const type2 = PluginType.fromString('external');
			expect(type1.equals(type2)).toBe(false);
		});
	});

	describe('toString', () => {
		test('should return the string value', () => {
			const type = PluginType.fromString('internal');
			expect(type.toString()).toBe('internal');
		});
	});
});
