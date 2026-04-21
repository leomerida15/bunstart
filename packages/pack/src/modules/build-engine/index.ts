// Domain
export type { BuildConfig } from './domain/entities/BuildConfig';
export type { BuildResult } from './domain/entities/BuildResult';
export { EntryPoint } from './domain/entities/EntryPoint';

export { BuildEnvironment } from './domain/value-objects/BuildEnvironment';
export { OutputFormat } from './domain/value-objects/OutputFormat';
export { ExternalStrategy } from './domain/value-objects/ExternalStrategy';

export type { BundlerPort } from './domain/ports/Bundler.port';
export type { PackageAnalyzerPort } from './domain/ports/PackageAnalyzer.port';

export { ExternalsResolver } from './domain/services/ExternalsResolver';
export { EntryPointResolver } from './domain/services/EntryPointResolver';

// Application
export { CreateBuildSettingsUseCase } from './app/use-cases/CreateBuildSettingsUseCase';
export { ResolveBuildConfigUseCase } from './app/use-cases/ResolveBuildConfigUseCase';
export { ExecuteBuildUseCase } from './app/use-cases/ExecuteBuildUseCase';
export type { UserBuildConfig } from './app/use-cases/CreateBuildSettingsUseCase';

// Infrastructure
export { BunBuildAdapter } from './infra/adapters/BunBuildAdapter';
export { PackageJsonAnalyzerAdapter } from './infra/adapters/PackageJsonAnalyzerAdapter';
export { BuildEngineFactory } from './infra/factories/BuildEngineFactory';
