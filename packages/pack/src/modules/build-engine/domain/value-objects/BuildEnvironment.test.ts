import { describe, it, expect } from 'bun:test';
import { BuildEnvironment } from './BuildEnvironment';

describe('BuildEnvironment', () => {
	it('auto-detects production from NODE_ENV', () => {
		process.env.NODE_ENV = 'production';
		const env = BuildEnvironment.autoDetect();
		expect(env.value).toBe('production');
		delete process.env.NODE_ENV;
	});

	it('auto-detects development from NODE_ENV', () => {
		process.env.NODE_ENV = 'development';
		const env = BuildEnvironment.autoDetect();
		expect(env.value).toBe('development');
		delete process.env.NODE_ENV;
	});

	it('defaults to development when no env var set', () => {
		delete process.env.NODE_ENV;
		delete process.env.BUN_ENV;
		const env = BuildEnvironment.autoDetect();
		expect(env.value).toBe('development');
	});

	it('NODE_ENV takes precedence over BUN_ENV', () => {
		process.env.NODE_ENV = 'production';
		process.env.BUN_ENV = 'development';
		const env = BuildEnvironment.autoDetect();
		expect(env.value).toBe('production');
		delete process.env.NODE_ENV;
		delete process.env.BUN_ENV;
	});

	it('creates from valid string', () => {
		const env = BuildEnvironment.fromString('production');
		expect(env.value).toBe('production');
	});

	it('throws on invalid string', () => {
		expect(() => BuildEnvironment.fromString('invalid')).toThrow('Invalid build environment');
	});

	it('equals returns true for same value', () => {
		const a = BuildEnvironment.fromString('production');
		const b = BuildEnvironment.fromString('production');
		expect(a.equals(b)).toBe(true);
	});

	it('equals returns false for different values', () => {
		const a = BuildEnvironment.fromString('production');
		const b = BuildEnvironment.fromString('development');
		expect(a.equals(b)).toBe(false);
	});
});
