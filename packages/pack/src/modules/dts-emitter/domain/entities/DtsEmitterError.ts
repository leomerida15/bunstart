/**
 * Error thrown when TypeScript declaration emission fails.
 */
export class DtsEmitterError extends Error {
	public constructor(
		message: string,
		public override readonly cause?: unknown,
	) {
		super(message);
		this.name = 'DtsEmitterError';
	}
}

/**
 * Creates a DtsEmitterError for TypeScript compilation errors.
 */
export function createDtsCompilationError(message: string, cause?: unknown): DtsEmitterError {
	return new DtsEmitterError(`TypeScript error: ${message}`, cause);
}

/**
 * Creates a DtsEmitterError for missing entry files.
 */
export function createDtsMissingEntryError(entry: string): DtsEmitterError {
	return new DtsEmitterError(`Missing entry file: ${entry}`);
}

/**
 * Creates a DtsEmitterError for permission issues.
 */
export function createDtsPermissionError(path: string): DtsEmitterError {
	return new DtsEmitterError(`Permission denied: unable to write to ${path}`);
}
