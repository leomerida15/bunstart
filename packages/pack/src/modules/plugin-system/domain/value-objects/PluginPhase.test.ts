import { test, expect, describe } from 'bun:test';
import { PluginPhase } from './PluginPhase';

describe('PluginPhase', () => {
	describe('fromString', () => {
		test('should create a valid pre-build phase', () => {
			const phase = PluginPhase.fromString('pre-build');
			expect(phase.value).toBe('pre-build');
		});

		test('should create a valid build phase', () => {
			const phase = PluginPhase.fromString('build');
			expect(phase.value).toBe('build');
		});

		test('should create a valid post-build phase', () => {
			const phase = PluginPhase.fromString('post-build');
			expect(phase.value).toBe('post-build');
		});

		test('should throw for invalid phase', () => {
			expect(() => PluginPhase.fromString('during')).toThrow(
				'Invalid plugin phase: during. Valid values are "pre-build", "build", or "post-build".',
			);
		});

		test('should throw for empty string', () => {
			expect(() => PluginPhase.fromString('')).toThrow();
		});
	});

	describe('equals', () => {
		test('should return true for same value', () => {
			const phase1 = PluginPhase.fromString('build');
			const phase2 = PluginPhase.fromString('build');
			expect(phase1.equals(phase2)).toBe(true);
		});

		test('should return false for different values', () => {
			const phase1 = PluginPhase.fromString('pre-build');
			const phase2 = PluginPhase.fromString('post-build');
			expect(phase1.equals(phase2)).toBe(false);
		});
	});

	describe('toString', () => {
		test('should return the string value', () => {
			const phase = PluginPhase.fromString('build');
			expect(phase.toString()).toBe('build');
		});
	});
});
