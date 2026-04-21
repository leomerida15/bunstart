import type { BuildConfig } from '../../../build-engine/domain/entities/BuildConfig';
import type { ExecuteBuildUseCase } from '../../../build-engine/app/use-cases/ExecuteBuildUseCase';
import { CheckIfRebuildNeededUseCase } from './CheckIfRebuildNeededUseCase';
import { UpdateCacheUseCase } from './UpdateCacheUseCase';

/**
 * Use case that orchestrates the incremental build flow:
 * 1. Check if rebuild is needed via cache
 * 2. Execute build if needed
 * 3. Update cache after successful build
 */
export class RunBuildWithCacheUseCase {
	private readonly checkUseCase: CheckIfRebuildNeededUseCase;
	private readonly executeBuildUseCase: ExecuteBuildUseCase;
	private readonly updateCacheUseCase: UpdateCacheUseCase;

	public constructor({
		checkUseCase,
		executeBuildUseCase,
		updateCacheUseCase,
	}: {
		checkUseCase: CheckIfRebuildNeededUseCase;
		executeBuildUseCase: ExecuteBuildUseCase;
		updateCacheUseCase: UpdateCacheUseCase;
	}) {
		this.checkUseCase = checkUseCase;
		this.executeBuildUseCase = executeBuildUseCase;
		this.updateCacheUseCase = updateCacheUseCase;
	}

	/**
	 * Executes a build with incremental caching.
	 * @param buildConfig - The build configuration
	 * @param packageName - Name of the package (for cache key)
	 */
	async execute(buildConfig: BuildConfig, packageName: string): Promise<void> {
		// Skip incremental logic if not enabled
		if (!buildConfig.incremental) {
			await this.executeBuildUseCase.execute(buildConfig);
			return;
		}

		// Check if rebuild is needed
		const entrypoints = buildConfig.entrypoints.map((ep) => ep.resolvedPath);
		const checkResult = await this.checkUseCase.execute(packageName, entrypoints);

		if (!checkResult.needsRebuild) {
			// No changes detected — skip build
			return;
		}

		// Execute the actual build
		await this.executeBuildUseCase.execute(buildConfig);

		// Update cache after successful build
		await this.updateCacheUseCase.execute(packageName, entrypoints);
	}
}