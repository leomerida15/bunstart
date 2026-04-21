import { CheckIfRebuildNeededUseCase } from '../../app/use-cases/CheckIfRebuildNeededUseCase';
import { UpdateCacheUseCase } from '../../app/use-cases/UpdateCacheUseCase';
import { InvalidateCacheUseCase } from '../../app/use-cases/InvalidateCacheUseCase';
import { RunBuildWithCacheUseCase } from '../../app/use-cases/RunBuildWithCacheUseCase';
import { DiskCacheAdapter } from '../adapters/DiskCacheAdapter';
import { Sha256HashAdapter } from '../adapters/Sha256HashAdapter';
import { ExecuteBuildUseCase } from '../../../build-engine/app/use-cases/ExecuteBuildUseCase';
import { BunBuildAdapter } from '../../../build-engine/infra/adapters/BunBuildAdapter';

/**
 * Factory for creating incremental build components.
 */
export class IncrementalBuildFactory {
	private static diskCache: DiskCacheAdapter | null = null;
	private static sha256Hash: Sha256HashAdapter | null = null;

	public static getDiskCacheAdapter(): DiskCacheAdapter {
		if (!this.diskCache) {
			this.diskCache = new DiskCacheAdapter();
		}
		return this.diskCache;
	}

	public static getSha256HashAdapter(): Sha256HashAdapter {
		if (!this.sha256Hash) {
			this.sha256Hash = new Sha256HashAdapter();
		}
		return this.sha256Hash;
	}

	public static createCheckIfRebuildNeededUseCase(): CheckIfRebuildNeededUseCase {
		return new CheckIfRebuildNeededUseCase({
			hashCalculator: this.getSha256HashAdapter(),
			cacheStorage: this.getDiskCacheAdapter(),
		});
	}

	public static createUpdateCacheUseCase(): UpdateCacheUseCase {
		return new UpdateCacheUseCase({
			hashCalculator: this.getSha256HashAdapter(),
			cacheStorage: this.getDiskCacheAdapter(),
		});
	}

	public static createInvalidateCacheUseCase(): InvalidateCacheUseCase {
		return new InvalidateCacheUseCase({
			cacheStorage: this.getDiskCacheAdapter(),
		});
	}

	public static createRunBuildWithCacheUseCase(): RunBuildWithCacheUseCase {
		return new RunBuildWithCacheUseCase({
			checkUseCase: this.createCheckIfRebuildNeededUseCase(),
			executeBuildUseCase: new ExecuteBuildUseCase({
				bundler: new BunBuildAdapter(),
			}),
			updateCacheUseCase: this.createUpdateCacheUseCase(),
		});
	}
}