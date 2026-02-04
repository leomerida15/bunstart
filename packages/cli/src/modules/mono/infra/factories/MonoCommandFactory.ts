import { MonoCommand } from '../../app/MonoCommand';
import { RepoStateUseCasesFactory } from '../../../repo-state/infra/factories/RepoStateUseCasesFactory';
import { NodeFilesystemAdapter } from '../../../init/infra/adapters/NodeFilesystemAdapter';
import { PackageJsonAdapter } from '../../../init/infra/adapters/PackageJsonAdapter';
import { MonorepoScaffolderAdapter } from '../../../init/infra/adapters/MonorepoScaffolderAdapter';

/**
 * Factory for creating MonoCommand instances with proper dependency injection.
 *
 * Following the Hexagonal Architecture and SOLID principles, this factory
 * handles the instantiation and wiring of the MonoCommand and its use cases.
 *
 * @class MonoCommandFactory
 */
export class MonoCommandFactory {
	/**
	 * Creates a new MonoCommand instance.
	 *
	 * @static
	 * @returns {MonoCommand} A fully configured MonoCommand instance
	 */
	public static create(): MonoCommand {
		const filesystem = new NodeFilesystemAdapter();
		const packageJson = new PackageJsonAdapter();
		const scaffolder = new MonorepoScaffolderAdapter({ filesystem, packageJson });
		return new MonoCommand({
			loadRepoState: RepoStateUseCasesFactory.createLoadRepoStateUseCase(),
			addApp: RepoStateUseCasesFactory.createAddAppUseCase(),
			addPackage: RepoStateUseCasesFactory.createAddPackageUseCase(),
			ensureDepsBuilt: RepoStateUseCasesFactory.createEnsureDepsBuiltUseCase(),
			runInWorkspace: RepoStateUseCasesFactory.createRunInWorkspaceUseCase(),
			syncDependsOn:
				RepoStateUseCasesFactory.createSyncDependsOnFromPackageJsonUseCase(),
			scaffolder
		});
	}
}
