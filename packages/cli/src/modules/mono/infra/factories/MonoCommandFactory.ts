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
import { AdoptProjectUseCase } from '../../app/use-cases/AdoptProjectUseCase';
import { BunRunInWorkspaceAdapter } from '../adapters/BunRunInWorkspaceAdapter';
import { BunBuildWorkspaceAdapter } from '../adapters/BunBuildWorkspaceAdapter';
import { BunRunBunInstallAdapter } from '../adapters/BunRunBunInstallAdapter';
import { SyncStateFileAdapter } from '../adapters/SyncStateFileAdapter';
import { PackageJsonAdapter } from '../../../init/infra/adapters/PackageJsonAdapter';
import { PackageJsonWorkspacesAdapter } from '../adapters/PackageJsonWorkspacesAdapter';
import { NodeFilesystemAdapter } from '../../../init/infra/adapters/NodeFilesystemAdapter';
import { InitCommandFactory } from '../../../init/infra/factories/InitCommandFactory';
import { CreateMonoRepoUseCase } from '../../app/use-cases/CreateMonoRepoUseCase';
import { MigrateMonoRepoUseCase } from '../../app/use-cases/MigrateMonoRepoUseCase';
import { EnquirerAdapter } from '../../../init/infra/adapters/EnquirerAdapter';
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
	private static resolveWorkspacesAdapter = new PackageJsonWorkspacesAdapter({
		packageJson: this.packageJson,
		loadConfig: this.loadConfig
	});
	private static syncStateAdapter = new SyncStateFileAdapter();
	private static syncDependsOn = new SyncDependsOnFromPackageJsonUseCase({
		resolveWorkspaces: this.resolveWorkspacesAdapter,
		loadConfig: this.loadConfig,
		patchConfig: this.patchConfig,
		packageJson: this.packageJson
	});
	private static addWorkspaceDep = new AddWorkspaceDepUseCase({
		resolveWorkspaces: this.resolveWorkspacesAdapter,
		runInWorkspace: this.runAdapter,
		syncDependsOn: this.syncDependsOn
	});
	private static removeWorkspaceDep = new RemoveWorkspaceDepUseCase({
		resolveWorkspaces: this.resolveWorkspacesAdapter,
		runInWorkspace: this.runAdapter,
		syncDependsOn: this.syncDependsOn
	});
	private static ensureConfigSynced = new EnsureConfigSyncedUseCase({
		resolveWorkspaces: this.resolveWorkspacesAdapter,
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
		const addApp = new AddAppUseCase({
			loadConfig: this.loadConfig,
			patchConfig: this.patchConfig
		});
		const addPackage = new AddPackageUseCase({
			loadConfig: this.loadConfig,
			patchConfig: this.patchConfig
		});
		const runBunInstall = new BunRunBunInstallAdapter();
		const adoptProject = new AdoptProjectUseCase({
			loadConfig: this.loadConfig,
			packageJson: this.packageJson,
			filesystem,
			addApp,
			addPackage,
			runBunInstall
		});

		const initCommand = InitCommandFactory.create();
		const userInterface = new EnquirerAdapter();

		const createMonoRepo = new CreateMonoRepoUseCase({
			initCommand,
			filesystem,
			userInterface
		});

		const initializeConfig = ConfigUseCasesFactory.createInitializeConfigUseCase();

		const migrateMonoRepo = new MigrateMonoRepoUseCase({
			resolveWorkspaces: this.resolveWorkspacesAdapter,
			adoptProject,
			userInterface,
			packageJson: packageJsonAdapter,
			initializeConfig
		});

		const selectTemplateUseCase = InitCommandFactory.createSelectTemplateUseCase();
		const bootstrapApiRestUseCase = InitCommandFactory.createBootstrapApiRestUseCase();
		const bootstrapFrontendReactUseCase = InitCommandFactory.createBootstrapFrontendReactUseCase();
		const bootstrapLibraryUseCase = InitCommandFactory.createBootstrapLibraryUseCase();

		return new MonoCommand({
			loadConfig: this.loadConfig,
			resolveWorkspaces: this.resolveWorkspacesAdapter,
			addApp,
			addPackage,
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
			runBunInstall,
			adoptProject,
			scaffolder,
			createMonoRepo,
			migrateMonoRepo,
			selectTemplateUseCase,
			bootstrapApiRestUseCase,
			bootstrapFrontendReactUseCase,
			bootstrapLibraryUseCase,
			packageJson: packageJsonAdapter,
			filesystem
		});
	}

	public static createEnsureDepsBuiltUseCase(): EnsureDepsBuiltUseCase {
		return new EnsureDepsBuiltUseCase({
			resolveWorkspaces: this.resolveWorkspacesAdapter,
			buildWorkspace: this.buildAdapter
		});
	}

	public static createRunInWorkspaceUseCase(): RunInWorkspaceUseCase {
		return new RunInWorkspaceUseCase({
			resolveWorkspaces: this.resolveWorkspacesAdapter,
			runInWorkspace: this.runAdapter
		});
	}

	public static createResolveWorkspacesAdapter(): PackageJsonWorkspacesAdapter {
		return this.resolveWorkspacesAdapter;
	}

	public static createEnsureConfigSyncedUseCase(): EnsureConfigSyncedUseCase {
		return this.ensureConfigSynced;
	}
}
