import { test, expect, describe } from 'bun:test';
import { DevServerConfig } from '../../../dev-server/domain/entities/DevServerConfig';

describe('DevServerConfig', () => {
	test('creates config with defaults', () => {
		const config = DevServerConfig.create();
		expect(config.portNumber).toBe(3000);
		expect(config.hostString).toBe('127.0.0.1');
		expect(config.root).toBe('./public');
		expect(config.cors).toBe(true);
		expect(config.compress).toBe(true);
		expect(config.hmr).toBe(true);
	});

	test('creates config with custom values', () => {
		const config = DevServerConfig.create({
			port: 8080,
			host: '0.0.0.0',
			root: './dist',
			cors: false,
			compress: false,
			hmr: false,
			hmrPath: '/ws',
		});

		expect(config.portNumber).toBe(8080);
		expect(config.hostString).toBe('0.0.0.0');
		expect(config.root).toBe('./dist');
		expect(config.cors).toBe(false);
		expect(config.compress).toBe(false);
		expect(config.hmr).toBe(false);
		expect(config.hmrPath).toBe('/ws');
	});

	test('hasHmr returns correct value', () => {
		expect(DevServerConfig.create({ hmr: true }).hasHmr()).toBe(true);
		expect(DevServerConfig.create({ hmr: false }).hasHmr()).toBe(false);
	});

	test('hasStaticFiles returns correct value', () => {
		expect(DevServerConfig.create({ root: './public' }).hasStaticFiles()).toBe(true);
		expect(DevServerConfig.create({ root: '' }).hasStaticFiles()).toBe(false);
		expect(DevServerConfig.create({ root: undefined }).hasStaticFiles()).toBe(true); // default
	});

	test('serverUrl returns correct URL', () => {
		const config = DevServerConfig.create({ port: 3000, host: 'localhost' });
		expect(config.serverUrl).toBe('http://localhost:3000');
	});

	test('entrypoints defaults to empty array', () => {
		const config = DevServerConfig.create();
		expect(config.entrypoints).toEqual([]);
	});

	test('entrypoints accepts custom values', () => {
		const config = DevServerConfig.create({
			entrypoints: ['./src/index.ts', './src/app.ts'],
		});
		expect(config.entrypoints).toEqual(['./src/index.ts', './src/app.ts']);
	});

	test('hmrPath defaults to /__hmr', () => {
		const config = DevServerConfig.create();
		expect(config.hmrPath).toBe('/__hmr');
	});

	test('hmrPath accepts custom value', () => {
		const config = DevServerConfig.create({ hmrPath: '/hot-reload' });
		expect(config.hmrPath).toBe('/hot-reload');
	});
});