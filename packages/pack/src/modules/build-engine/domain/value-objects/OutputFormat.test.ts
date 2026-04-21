import { describe, it, expect } from 'bun:test';
import { OutputFormat } from './OutputFormat';

describe('OutputFormat', () => {
	it('creates from valid esm string', () => {
		const format = OutputFormat.fromString('esm');
		expect(format.value).toBe('esm');
	});

	it('creates from valid cjs string', () => {
		const format = OutputFormat.fromString('cjs');
		expect(format.value).toBe('cjs');
	});

	it('creates from valid iife string', () => {
		const format = OutputFormat.fromString('iife');
		expect(format.value).toBe('iife');
	});

	it('throws on invalid format string', () => {
		expect(() => OutputFormat.fromString('commonjs')).toThrow('Invalid output format');
	});

	it('equals returns true for same format', () => {
		const a = OutputFormat.fromString('esm');
		const b = OutputFormat.fromString('esm');
		expect(a.equals(b)).toBe(true);
	});

	it('equals returns false for different formats', () => {
		const a = OutputFormat.fromString('esm');
		const b = OutputFormat.fromString('cjs');
		expect(a.equals(b)).toBe(false);
	});
});
