// Domain - Value Objects
export { PluginType } from './domain/value-objects/PluginType';
export { PluginPhase } from './domain/value-objects/PluginPhase';

// Domain - Entities
export type { PluginDefinition } from './domain/entities/PluginDefinition';
export { PluginRegistry } from './domain/entities/PluginRegistry';

// Domain - Ports
export type { PluginLoaderPort } from './domain/ports/PluginLoader.port';

// Domain - Services
export { PluginValidator } from './domain/services/PluginValidator';
export { PluginOrderResolver } from './domain/services/PluginOrderResolver';

// Application - Use Cases
export { RegisterPluginUseCase } from './app/use-cases/RegisterPluginUseCase';
export type { RegisterPluginInput } from './app/use-cases/RegisterPluginUseCase';
export { ResolvePluginsUseCase } from './app/use-cases/ResolvePluginsUseCase';
export type { ResolvedPlugins, ResolvePluginsInput } from './app/use-cases/ResolvePluginsUseCase';
export { LoadExternalPluginUseCase } from './app/use-cases/LoadExternalPluginUseCase';
export type { LoadExternalPluginConfig } from './app/use-cases/LoadExternalPluginUseCase';

// Infrastructure - Adapters
export { BunPluginLoaderAdapter } from './infra/adapters/BunPluginLoaderAdapter';

// Infrastructure - Factories
export { PluginSystemFactory } from './infra/factories/PluginSystemFactory';

// Errors
export { PluginNotFoundError } from '../../shared/errors/PluginNotFoundError';
