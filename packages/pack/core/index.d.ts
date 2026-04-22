import type { UserBuildConfig } from "./modules/build-engine/app/use-cases/CreateBuildSettingsUseCase";
import type { ServerHandle } from "./modules/dev-server/domain/ports/DevServer.port";
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
export declare function buildSetting(config: UserBuildConfig): BuildEnginePublicAPI;
export type { BuildConfig } from "./modules/build-engine/domain/entities/BuildConfig";
export type { BuildResult } from "./modules/build-engine/domain/entities/BuildResult";
export { EntryPoint } from "./modules/build-engine/domain/entities/EntryPoint";
export { BuildEnvironment } from "./modules/build-engine/domain/value-objects/BuildEnvironment";
export { OutputFormat } from "./modules/build-engine/domain/value-objects/OutputFormat";
export { ExternalStrategy } from "./modules/build-engine/domain/value-objects/ExternalStrategy";
export type { BundlerPort } from "./modules/build-engine/domain/ports/Bundler.port";
export type { PackageAnalyzerPort } from "./modules/build-engine/domain/ports/PackageAnalyzer.port";
export type { DtsEmitterResult } from "./modules/dts-emitter/domain/value-objects/DtsEmitterResult";
export { ContentHash } from "./modules/incremental-build/domain/value-objects/ContentHash";
export { BuildCache } from "./modules/incremental-build/domain/entities/BuildCache";
export type { RebuildCheckResult } from "./modules/incremental-build/app/use-cases/CheckIfRebuildNeededUseCase";
export { InvalidateCacheUseCase } from "./modules/incremental-build/app/use-cases/InvalidateCacheUseCase";
export { DevServerConfig } from "./modules/dev-server/domain/entities/DevServerConfig";
export type { DevServerConfigOptions } from "./modules/dev-server/domain/entities/DevServerConfig";
export { HotReloadConfig } from "./modules/dev-server/domain/entities/HotReloadConfig";
export type { HotReloadConfigOptions } from "./modules/dev-server/domain/entities/HotReloadConfig";
export { DevServerError } from "./modules/dev-server/domain/entities/DevServerError";
export { ServerPort } from "./modules/dev-server/domain/value-objects/ServerPort";
export { ServerHost } from "./modules/dev-server/domain/value-objects/ServerHost";
export { ReloadStrategy, ReloadStrategyType } from "./modules/dev-server/domain/value-objects/ReloadStrategy";
export type { ServerHandle } from "./modules/dev-server/domain/ports/DevServer.port";
