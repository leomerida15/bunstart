import { BuildEngineFactory } from './modules/build-engine/infra/factories/BuildEngineFactory';
import type { UserBuildConfig } from './modules/build-engine/app/use-cases/CreateBuildSettingsUseCase';
import { PluginSystemFactory } from './modules/plugin-system/infra/factories/PluginSystemFactory';

/**
 * Public API for configuring and executing builds.
 */
export interface BuildEnginePublicAPI {
	/**
	 * Executes the build.
	 */
	build(): Promise<void>;
	/**
	 * Starts the dev server (not yet implemented).
	 */
	serve(): Promise<void>;
	/**
	 * Starts the watch mode (not yet implemented).
	 */
	watch(): Promise<void>;
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
 * const { build } = buildSetting({ entrypoints: ["./src/index.ts"] });
 * await build();
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
		async serve() {
			// TODO: Sprint 6 — dev-server module
			throw new Error('Dev server not yet implemented. Use build() for now.');
		},
		async watch() {
			// TODO: Sprint 6 — dev-server module
			throw new Error('Watch mode not yet implemented. Use build() for now.');
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
