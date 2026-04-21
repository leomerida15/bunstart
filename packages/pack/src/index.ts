import { BuildEngineFactory } from './modules/build-engine/infra/factories/BuildEngineFactory';
import type { UserBuildConfig } from './modules/build-engine/app/use-cases/CreateBuildSettingsUseCase';
import { PluginSystemFactory } from './modules/plugin-system/infra/factories/PluginSystemFactory';
import { DevServerFactory } from './modules/dev-server/infra/factories/DevServerFactory';
import { DevServerConfig } from './modules/dev-server/domain/entities/DevServerConfig';
import { HotReloadConfig } from './modules/dev-server/domain/entities/HotReloadConfig';
import type { ServerHandle } from './modules/dev-server/domain/ports/DevServer.port';

/**
 * Public API for configuring and executing builds.
 */
export interface BuildEnginePublicAPI {
	/**
	 * Executes the build.
	 */
	build(): Promise<void>;
	/**
	 * Starts the dev server.
	 */
	serve(options?: ServeOptions): Promise<ServerHandle>;
	/**
	 * Starts the watch mode with file watching and rebuild.
	 */
	watch(options?: WatchOptions): Promise<WatchHandle>;
}

/**
 * Options for serve()
 */
export interface ServeOptions {
	/** Port to bind the server to. Default: 3000 */
	port?: number;
	/** Host to bind the server to. Default: "127.0.0.1" */
	host?: string;
	/** Root directory for static files. Default: "./public" */
	root?: string;
	/** Enable HMR. Default: true */
	hmr?: boolean;
}

/**
 * Options for watch()
 */
export interface WatchOptions {
	/** Port to bind the server to. Default: 3000 */
	port?: number;
	/** Host to bind the server to. Default: "127.0.0.1" */
	host?: string;
	/** Root directory for static files. Default: "./public" */
	root?: string;
	/** Enable HMR. Default: true */
	hmr?: boolean;
	/** Paths to watch. Default: ["src"] */
	watchPaths?: string[];
	/** Debounce delay for rebuilds in ms. Default: 100 */
	debounceMs?: number;
}

/**
 * Handle for watch mode.
 */
export interface WatchHandle {
	/** Server handle */
	server: ServerHandle;
	/** Stop watching and close server */
	stop(): Promise<void>;
}

// Initialize internal plugins once at module load time
function initializePluginSystem(): void {
	const registry = PluginSystemFactory.getRegistry();
	const registerUseCase = PluginSystemFactory.createRegisterPluginUseCase();

	// TODO: Register internal plugins here when they are implemented
	// Example:
	// registerUseCase.execute({
	//   bunPlugin: { name: 'dts-emitter', hooks: { setup: (...) } },
	//   type: 'internal',
	//   phase: 'post-build',
	//   priority: 10,
	// });
}

// Run initialization
initializePluginSystem();

/**
 * Central configuration function for @bunstart/pack.
 * Returns a BuildEnginePublicAPI with .build(), .serve(), and .watch() methods.
 *
 * @example
 * const { build, serve, watch } = buildSetting({ entrypoints: ["./src/index.ts"] });
 * await build();
 * await serve({ port: 3000 });
 * await watch({ port: 3000, watchPaths: ["src"] });
 */
export function buildSetting(config: UserBuildConfig): BuildEnginePublicAPI {
	const factory = BuildEngineFactory;

	return {
		async build() {
			const createUseCase = factory.createCreateBuildSettingsUseCase();
			const resolveUseCase = factory.createResolveBuildConfigUseCase();
			const executeUseCase = factory.createExecuteBuildUseCase();

			const cwd = process.cwd();
			const partialConfig = await createUseCase.execute(config, cwd);
			const resolvedConfig = await resolveUseCase.execute(partialConfig, config, cwd);
			await executeUseCase.execute(resolvedConfig);
		},

		async serve(options: ServeOptions = {}) {
			const devConfig = DevServerConfig.create({
				port: options.port ?? 3000,
				host: options.host ?? '127.0.0.1',
				root: options.root ?? './public',
				hmr: options.hmr ?? true,
				entrypoints: config.entrypoints ?? [],
			});

			const hmrConfig = HotReloadConfig.create({
				enabled: options.hmr ?? true,
			});

			const useCase = DevServerFactory.createStartDevServerUseCase();
			const result = await useCase.execute({
				config: devConfig,
				hmrConfig,
			});

			return result.server;
		},

		async watch(options: WatchOptions = {}) {
			const devConfig = DevServerConfig.create({
				port: options.port ?? 3000,
				host: options.host ?? '127.0.0.1',
				root: options.root ?? './public',
				hmr: options.hmr ?? true,
				entrypoints: config.entrypoints ?? [],
			});

			const hmrConfig = HotReloadConfig.create({
				enabled: options.hmr ?? true,
			});

			// Start the dev server
			const serverUseCase = DevServerFactory.createStartDevServerUseCase();
			const { server } = await serverUseCase.execute({
				config: devConfig,
				hmrConfig,
			});

			// Start watching files
			const watchPaths = options.watchPaths ?? ['src'];
			const debounceMs = options.debounceMs ?? 100;

			const watchUseCase = DevServerFactory.createWatchFilesUseCase(devConfig);
			await watchUseCase.execute({
				paths: watchPaths,
				debounceMs,
				onChange: async (event) => {
					console.log(`[Watch] Change detected: ${event.path}`);
					// TODO: Trigger rebuild using build-engine
					// For now, just log the change
				},
			});

			return {
				server,
				async stop() {
					await watchUseCase.stop();
					await server.stop();
				},
			};
		},
	};
}

// Re-export types for consumers
export type { BuildConfig } from './modules/build-engine/domain/entities/BuildConfig';
export type { BuildResult } from './modules/build-engine/domain/entities/BuildResult';
export { EntryPoint } from './modules/build-engine/domain/entities/EntryPoint';
export { BuildEnvironment } from './modules/build-engine/domain/value-objects/BuildEnvironment';
export { OutputFormat } from './modules/build-engine/domain/value-objects/OutputFormat';
export { ExternalStrategy } from './modules/build-engine/domain/value-objects/ExternalStrategy';
export type { BundlerPort } from './modules/build-engine/domain/ports/Bundler.port';
export type { PackageAnalyzerPort } from './modules/build-engine/domain/ports/PackageAnalyzer.port';

// Re-export DTS types
export type { DtsEmitterResult } from './modules/dts-emitter/domain/value-objects/DtsEmitterResult';

// Re-export incremental build types
export { ContentHash } from './modules/incremental-build/domain/value-objects/ContentHash';
export { BuildCache } from './modules/incremental-build/domain/entities/BuildCache';
export type { RebuildCheckResult } from './modules/incremental-build/app/use-cases/CheckIfRebuildNeededUseCase';
export { InvalidateCacheUseCase } from './modules/incremental-build/app/use-cases/InvalidateCacheUseCase';

// Re-export dev-server types
export { DevServerConfig } from './modules/dev-server/domain/entities/DevServerConfig';
export type { DevServerConfigOptions } from './modules/dev-server/domain/entities/DevServerConfig';
export { HotReloadConfig } from './modules/dev-server/domain/entities/HotReloadConfig';
export type { HotReloadConfigOptions } from './modules/dev-server/domain/entities/HotReloadConfig';
export { DevServerError } from './modules/dev-server/domain/entities/DevServerError';
export { ServerPort } from './modules/dev-server/domain/value-objects/ServerPort';
export { ServerHost } from './modules/dev-server/domain/value-objects/ServerHost';
export {
	ReloadStrategy,
	ReloadStrategyType,
} from './modules/dev-server/domain/value-objects/ReloadStrategy';
export type { ServerHandle } from './modules/dev-server/domain/ports/DevServer.port';
// WatchHandle is defined as interface above
