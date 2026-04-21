/**
 * Result of TypeScript declaration file emission.
 */
export interface DtsEmitterResult {
	/**
	 * Whether the emission succeeded.
	 */
	success: boolean;
	/**
	 * List of generated .d.ts file paths.
	 */
	generatedFiles: string[];
	/**
	 * Time taken to emit declarations in milliseconds.
	 */
	durationMs: number;
	/**
	 * List of error messages if emission failed.
	 */
	errors: string[];
}

/**
 * Creates a successful DtsEmitterResult.
 */
export function createDtsEmitterSuccess(
	generatedFiles: string[],
	durationMs: number,
): DtsEmitterResult {
	return {
		success: true,
		generatedFiles,
		durationMs,
		errors: [],
	};
}

/**
 * Creates a failed DtsEmitterResult.
 */
export function createDtsEmitterFailure(errors: string[], durationMs: number): DtsEmitterResult {
	return {
		success: false,
		generatedFiles: [],
		durationMs,
		errors,
	};
}

/**
 * Creates a no-op result when DTS is disabled.
 */
export function createDtsEmitterNoOp(): DtsEmitterResult {
	return {
		success: true,
		generatedFiles: [],
		durationMs: 0,
		errors: [],
	};
}
