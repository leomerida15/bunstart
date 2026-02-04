import { AddAppUseCase } from '../../app/use-cases/AddAppUseCase';
import { AddPackageUseCase } from '../../app/use-cases/AddPackageUseCase';
import { EnsureDepsBuiltUseCase } from '../../app/use-cases/EnsureDepsBuiltUseCase';
import { InitializeRepoStateUseCase } from '../../app/use-cases/InitializeRepoStateUseCase';
import { LoadRepoStateUseCase } from '../../app/use-cases/LoadRepoStateUseCase';
import { RunInWorkspaceUseCase } from '../../app/use-cases/RunInWorkspaceUseCase';
import { SyncDependsOnFromPackageJsonUseCase } from '../../app/use-cases/SyncDependsOnFromPackageJsonUseCase';
import { BunBuildWorkspaceAdapter } from '../adapters/BunBuildWorkspaceAdapter';
import { BunRunInWorkspaceAdapter } from '../adapters/BunRunInWorkspaceAdapter';
import { BunstartConfigFileAdapter } from '../adapters/BunstartConfigFileAdapter';
import { PackageJsonAdapter } from '../../../init/infra/adapters/PackageJsonAdapter';

/**
 * Factory for repo-state use cases with default adapters.
 */
export class RepoStateUseCasesFactory {
	private static storage = new BunstartConfigFileAdapter();
	private static runAdapter = new BunRunInWorkspaceAdapter();
	private static buildAdapter = new BunBuildWorkspaceAdapter();
	private static packageJson = new PackageJsonAdapter();

	static createLoadRepoStateUseCase(): LoadRepoStateUseCase {
		return new LoadRepoStateUseCase({ storage: this.storage });
	}

	static createInitializeRepoStateUseCase(): InitializeRepoStateUseCase {
		return new InitializeRepoStateUseCase({ storage: this.storage });
	}

	static createRunInWorkspaceUseCase(): RunInWorkspaceUseCase {
		return new RunInWorkspaceUseCase({
			loadRepoState: this.createLoadRepoStateUseCase(),
			runInWorkspace: this.runAdapter
		});
	}

	static createAddAppUseCase(): AddAppUseCase {
		return new AddAppUseCase({ storage: this.storage });
	}

	static createAddPackageUseCase(): AddPackageUseCase {
		return new AddPackageUseCase({ storage: this.storage });
	}

	static createSyncDependsOnFromPackageJsonUseCase(): SyncDependsOnFromPackageJsonUseCase {
		return new SyncDependsOnFromPackageJsonUseCase({
			storage: this.storage,
			packageJson: this.packageJson
		});
	}

	static createEnsureDepsBuiltUseCase(): EnsureDepsBuiltUseCase {
		return new EnsureDepsBuiltUseCase({
			loadRepoState: this.createLoadRepoStateUseCase(),
			buildWorkspace: this.buildAdapter
		});
	}
}
