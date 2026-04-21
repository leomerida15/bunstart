import type { BuildConfig } from '../entities/BuildConfig';
import type { BuildResult } from '../entities/BuildResult';

/**
 * Port for executing builds.
 * Abstracts the underlying bundler (e.g., Bun.build) to allow testing.
 */
export interface BundlerPort {
	execute(config: BuildConfig): Promise<BuildResult>;
}
