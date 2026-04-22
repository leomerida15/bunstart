import { test, expect, describe } from 'bun:test';
import { ServerHost } from '../../../dev-server/domain/value-objects/ServerHost';

describe('ServerHost', () => {
	test('creates valid host', () => {
		const host = ServerHost.create('localhost');
		expect(host.value).toBe('localhost');
	});

	test('creates localhost host', () => {
		const host = ServerHost.localhost();
		expect(host.value).toBe('127.0.0.1');
	});

	test('creates any host', () => {
		const host = ServerHost.any();
		expect(host.value).toBe('0.0.0.0');
	});

	test('trims whitespace', () => {
		const host = ServerHost.create('  localhost  ');
		expect(host.value).toBe('localhost');
	});

	test('throws for empty host', () => {
		expect(() => ServerHost.create('')).toThrow();
	});

	test('throws for whitespace-only host', () => {
		expect(() => ServerHost.create('   ')).toThrow();
	});

	test('equals returns true for same host', () => {
		const host1 = ServerHost.create('localhost');
		const host2 = ServerHost.create('localhost');
		expect(host1.equals(host2)).toBe(true);
	});

	test('toString returns string value', () => {
		const host = ServerHost.create('localhost');
		expect(host.toString()).toBe('localhost');
	});
});