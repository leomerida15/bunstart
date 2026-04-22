// Domain exports
export type { DtsConfig } from './domain/value-objects/DtsConfig';
export { createDtsConfig } from './domain/value-objects/DtsConfig';

export type { DtsEmitterResult } from './domain/value-objects/DtsEmitterResult';
export {
	createDtsEmitterSuccess,
	createDtsEmitterFailure,
	createDtsEmitterNoOp,
} from './domain/value-objects/DtsEmitterResult';

export { DtsEmitterError } from './domain/entities/DtsEmitterError';
export {
	createDtsCompilationError,
	createDtsMissingEntryError,
	createDtsPermissionError,
} from './domain/entities/DtsEmitterError';

export type { DtsEmitterPort } from './domain/ports/DtsEmitter.port';

// Application exports
export { EmitDtsUseCase } from './app/use-cases/EmitDtsUseCase';

// Infrastructure exports
export { BunPluginDtsAdapter } from './infra/adapters/BunPluginDtsAdapter';
export { DtsEmitterFactory } from './infra/factories/DtsEmitterFactory';
