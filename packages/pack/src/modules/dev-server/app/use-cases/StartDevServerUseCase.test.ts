import { test, expect, describe, beforeEach, afterEach } from 'bun:test';
import { DevServerConfig } from '../../../dev-server/domain/entities/DevServerConfig';
import { HotReloadConfig } from '../../../dev-server/domain/entities/HotReloadConfig';
import { StartDevServerUseCase } from '../../../dev-server/app/use-cases/StartDevServerUseCase';
import { BunServeAdapter } from '../../../dev-server/infra/adapters/BunServeAdapter';
import type { ServerHandle } from '../../../dev-server/domain/ports/DevServer.port';

describe('StartDevServerUseCase', () => {
	let useCase: StartDevServerUseCase;
	let adapter: BunServeAdapter;
	let serverHandle: ServerHandle | null = null;

	beforeEach(() => {
		adapter = new BunServeAdapter();
		useCase = new StartDevServerUseCase(adapter);
	});

	afterEach(async () => {
		if (serverHandle) {
			await serverHandle.stop();
			serverHandle = null;
		}
	});

	test('starts server with default config', async () => {
		const config = DevServerConfig.create({ port: 3001 });
		const hmrConfig = HotReloadConfig.disabled();

		const result = await useCase.execute({
			config,
			hmrConfig,
		});

		expect(result.server).toBeDefined();
		expect(result.server.port).toBe(3001);
		expect(result.server.host).toBe('127.0.0.1');
		expect(result.server.url).toBe('http://127.0.0.1:3001');
		expect(result.hmrUrl).toBeUndefined();

		serverHandle = result.server;
	});

	test('starts server with HMR enabled', async () => {
		const config = DevServerConfig.create({ port: 3002, hmr: true });
		const hmrConfig = HotReloadConfig.defaults();

		const result = await useCase.execute({
			config,
			hmrConfig,
		});

		expect(result.server).toBeDefined();
		expect(result.hmrUrl).toBe('ws://127.0.0.1:3002/__hmr');

		serverHandle = result.server;
	});

	test('throws when server already running', async () => {
		const config1 = DevServerConfig.create({ port: 3003 });
		const config2 = DevServerConfig.create({ port: 3003 });
		const hmrConfig = HotReloadConfig.disabled();

		const result1 = await useCase.execute({
			config: config1,
			hmrConfig,
		});
		serverHandle = result1.server;

		await expect(
			useCase.execute({
				config: config2,
				hmrConfig,
			})
		).rejects.toThrow();

		await result1.server.stop();
		serverHandle = null;
	});

	test('server.stop() stops the server', async () => {
		const config = DevServerConfig.create({ port: 3004 });
		const hmrConfig = HotReloadConfig.disabled();

		const result = await useCase.execute({
			config,
			hmrConfig,
		});

		expect(adapter.isRunning()).toBe(true);

		await result.server.stop();

		expect(adapter.isRunning()).toBe(false);
		serverHandle = null;
	});
});