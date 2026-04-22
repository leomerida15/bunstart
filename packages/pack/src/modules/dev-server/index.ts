// Domain exports
export { DevServerConfig } from './domain/entities/DevServerConfig';
export type { DevServerConfigOptions } from './domain/entities/DevServerConfig';
export { HotReloadConfig } from './domain/entities/HotReloadConfig';
export type { HotReloadConfigOptions } from './domain/entities/HotReloadConfig';
export { DevServerError } from './domain/entities/DevServerError';

// Value Objects exports
export { ServerPort } from './domain/value-objects/ServerPort';
export { ServerHost } from './domain/value-objects/ServerHost';
export { ReloadStrategy, ReloadStrategyType } from './domain/value-objects/ReloadStrategy';

// Port exports
export type {
	DevServerPort,
	ServerHandle,
	FileWatcherPort,
	FileChangeCallback,
	FileChangeEvent,
	WatcherHandle,
	HmrConnectionPort,
	HmrMessage,
	HmrReloadMessage,
	HmrUpdateMessage,
	HmrErrorMessage,
	HmrReadyMessage,
} from './domain/ports/DevServer.port';

// Use Case exports
export { StartDevServerUseCase } from './app/use-cases/StartDevServerUseCase';
export type {
	StartDevServerInput,
	StartDevServerOutput,
} from './app/use-cases/StartDevServerUseCase';
export { WatchFilesUseCase } from './app/use-cases/WatchFilesUseCase';
export type {
	WatchFilesInput,
	WatchFilesOutput,
} from './app/use-cases/WatchFilesUseCase';

// Infra exports
export { DevServerFactory } from './infra/factories/DevServerFactory';
export { BunServeAdapter } from './infra/adapters/BunServeAdapter';
export { FsWatcherAdapter } from './infra/adapters/FsWatcherAdapter';