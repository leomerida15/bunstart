import type { BuildError } from '../../../../shared/errors/BuildError';

/**
 * Output file produced by a build.
 */
export interface OutputFile {
	path: string;
	size: number;
}

/**
 * Result of a build execution.
 */
export interface BuildResult {
	success: boolean;
	outputs: OutputFile[];
	errors: BuildError[];
	durationMs: number;
}
