import { test, expect, describe } from 'bun:test';
import { ServerPort } from '../../../dev-server/domain/value-objects/ServerPort';

describe('ServerPort', () => {
	test('creates valid port', () => {
		const port = ServerPort.create(3000);
		expect(port.value).toBe(3000);
	});

	test('creates default port', () => {
		const port = ServerPort.default();
		expect(port.value).toBe(3000);
	});

	test('throws for invalid port (too low)', () => {
		expect(() => ServerPort.create(0)).toThrow();
	});

	test('throws for invalid port (too high)', () => {
		expect(() => ServerPort.create(70000)).toThrow();
	});

	test('throws for non-integer port', () => {
		expect(() => ServerPort.create(3000.5)).toThrow();
	});

	test('equals returns true for same port', () => {
		const port1 = ServerPort.create(3000);
		const port2 = ServerPort.create(3000);
		expect(port1.equals(port2)).toBe(true);
	});

	test('equals returns false for different port', () => {
		const port1 = ServerPort.create(3000);
		const port2 = ServerPort.create(3001);
		expect(port1.equals(port2)).toBe(false);
	});

	test('toString returns string value', () => {
		const port = ServerPort.create(3000);
		expect(port.toString()).toBe('3000');
	});
});