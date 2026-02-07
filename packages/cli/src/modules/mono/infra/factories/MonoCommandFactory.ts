import { MonoCommand } from '../../app/MonoCommand';
import { ConfigUseCasesFactory } from '../../../config-state/infra/factories/ConfigUseCasesFactory';
import { AddAppUseCase } from '../../app/use-cases/AddAppUseCase';
import { AddPackageUseCase } from '../../app/use-cases/AddPackageUseCase';
import { RemoveAppUseCase } from '../../app/use-cases/RemoveAppUseCase';
import { RemovePackageUseCase } from '../../app/use-cases/RemovePackageUseCase';
import { EnsureDepsBuiltUseCase } from '../../app/use-cases/EnsureDepsBuiltUseCase';
import { RunInWorkspaceUseCase } from '../../app/use-cases/RunInWorkspaceUseCase';
import { SyncDependsOnFromPackageJsonUseCase } from '../../app/use-cases/SyncDependsOnFromPackageJsonUseCase';
import { AddWorkspaceDepUseCase } from '../../app/use-cases/AddWorkspaceDepUseCase';
import { RemoveWorkspaceDepUseCase } from '../../app/use-cases/RemoveWorkspaceDepUseCase';
import { EnsureConfigSyncedUseCase } from '../../app/use-cases/EnsureConfigSyncedUseCase';
import { BunRunInWorkspaceAdapter } from '../adapters/BunRunInWorkspaceAdapter';
import { BunBuildWorkspaceAdapter } from '../adapters/BunBuildWorkspaceAdapter';
import { BunRunBunInstallAdapter } from '../adapters/BunRunBunInstallAdapter';
import { SyncStateFileAdapter } from '../adapters/SyncStateFileAdapter';
import { PackageJsonAdapter } from '../../../init/infra/adapters/PackageJsonAdapter';
import { NodeFilesystemAdapter } from '../../../init/infra/adapters/NodeFilesystemAdapter';
import { MonorepoScaffolderAdapter } from '../../../init/infra/adapters/MonorepoScaffolderAdapter';

/**
 * Factory for creating MonoCommand instances and mono use cases with proper dependency injection.
 */
export class MonoCommandFactory {
	private static loadConfig = ConfigUseCasesFactory.createLoadConfigUseCase();
	private static patchConfig = ConfigUseCasesFactory.createPatchConfigUseCase();
	private static runAdapter = new BunRunInWorkspaceAdapter();
	private static buildAdapter = new BunBuildWorkspaceAdapter();
	private static packageJson = new PackageJsonAdapter();
	private static syncStateAdapter = new SyncStateFileAdapter();
	private static syncDependsOn = new SyncDependsOnFromPackageJsonUseCase({
		loadConfig: this.loadConfig,
		patchConfig: this.patchConfig,
		packageJson: this.packageJson
	});
	private static addWorkspaceDep = new AddWorkspaceDepUseCase({
		loadConfig: this.loadConfig,
		runInWorkspace: this.runAdapter,
		syncDependsOn: this.syncDependsOn
	});
	private static removeWorkspaceDep = new RemoveWorkspaceDepUseCase({
		loadConfig: this.loadConfig,
		runInWorkspace: this.runAdapter,
		syncDependsOn: this.syncDependsOn
	});
	private static ensureConfigSynced = new EnsureConfigSyncedUseCase({
		loadConfig: this.loadConfig,
		syncDependsOn: this.syncDependsOn,
		syncState: this.syncStateAdapter
	});

	public static create(): MonoCommand {
		const filesystem = new NodeFilesystemAdapter();
		const packageJsonAdapter = new PackageJsonAdapter();
		const scaffolder = new MonorepoScaffolderAdapter({
			filesystem,
			packageJson: packageJsonAdapter
		});
		return new MonoCommand({
			loadConfig: this.loadConfig,
			addApp: new AddAppUseCase({
				loadConfig: this.loadConfig,
				patchConfig: this.patchConfig
			}),
			addPackage: new AddPackageUseCase({
				loadConfig: this.loadConfig,
				patchConfig: this.patchConfig
			}),
			removeApp: new RemoveAppUseCase({
				loadConfig: this.loadConfig,
				patchConfig: this.patchConfig
			}),
			removePackage: new RemovePackageUseCase({
				loadConfig: this.loadConfig,
				patchConfig: this.patchConfig
			}),
			ensureConfigSynced: this.ensureConfigSynced,
			ensureDepsBuilt: this.createEnsureDepsBuiltUseCase(),
			runInWorkspace: this.createRunInWorkspaceUseCase(),
			syncDependsOn: this.syncDependsOn,
			addWorkspaceDep: this.addWorkspaceDep,
			removeWorkspaceDep: this.removeWorkspaceDep,
			runBunInstall: new BunRunBunInstallAdapter(),
			scaffolder
		});
	}

	public static createEnsureDepsBuiltUseCase(): EnsureDepsBuiltUseCase {
		return new EnsureDepsBuiltUseCase({
			loadConfig: this.loadConfig,
			buildWorkspace: this.buildAdapter
		});
	}

	public static createRunInWorkspaceUseCase(): RunInWorkspaceUseCase {
		return new RunInWorkspaceUseCase({
			loadConfig: this.loadConfig,
			runInWorkspace: this.runAdapter
		});
	}

	public static createEnsureConfigSyncedUseCase(): EnsureConfigSyncedUseCase {
		return this.ensureConfigSynced;
	}
}
