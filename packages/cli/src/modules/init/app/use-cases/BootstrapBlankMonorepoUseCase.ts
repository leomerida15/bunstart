import { MonorepoConfig } from '../../domain/entities/MonorepoConfig';
import { MonorepoAlias } from '../../domain/value-objects/MonorepoAlias';
import type { BunRuntimePort } from '../../domain/ports/BunRuntime.port';
import type { MonorepoScaffolderPort } from '../../domain/ports/MonorepoScaffolder.port';
import type { UserInterfacePort } from '../../domain/ports/UserInterface.port';
import { createAppEntry } from '../../../repo-state/domain/entities/AppEntry';
import { createPackageEntry } from '../../../repo-state/domain/entities/PackageEntry';
import { createRepoState } from '../../../repo-state/domain/entities/RepoState';
import type { InitializeRepoStateUseCase } from '../../../repo-state/app/use-cases/InitializeRepoStateUseCase';

export interface BootstrapBlankMonorepoUseCaseProps {
	bunRuntime: BunRuntimePort;
	userInterface: UserInterfacePort;
	scaffolder: MonorepoScaffolderPort;
	initializeRepoState: InitializeRepoStateUseCase;
}

/**
 * Use case for bootstrapping a blank monorepo (bun init + scaffold).
 *
 * @class BootstrapBlankMonorepoUseCase
 */
export class BootstrapBlankMonorepoUseCase {
	private readonly bunRuntime: BunRuntimePort;
	private readonly userInterface: UserInterfacePort;
	private readonly scaffolder: MonorepoScaffolderPort;
	private readonly initializeRepoState: InitializeRepoStateUseCase;

	constructor({
		bunRuntime,
		userInterface,
		scaffolder,
		initializeRepoState
	}: BootstrapBlankMonorepoUseCaseProps) {
		this.bunRuntime = bunRuntime;
		this.userInterface = userInterface;
		this.scaffolder = scaffolder;
		this.initializeRepoState = initializeRepoState;
	}

	public async execute(cwd: string): Promise<void> {
		console.log('\nRunning bun init...');
		await this.bunRuntime.initBlank(cwd);

		const aliasInput = await this.userInterface.askAlias(
			'Monorepo alias (e.g. myorg or @myorg):'
		);
		if (aliasInput === null) {
			console.log('\nOperation cancelled.');
			return;
		}

		const alias = MonorepoAlias.fromString(aliasInput);
		const config = MonorepoConfig.create({ alias });

		console.log('\nScaffolding monorepo structure...');
		await this.scaffolder.scaffold(config, cwd);

		const scope = config.alias.toScoped();
		const initialState = createRepoState(
			{
				[config.exampleAppName]: createAppEntry(
					`${scope}/${config.exampleAppName}`,
					[config.examplePackageName]
				)
			},
			{
				[config.examplePackageName]: createPackageEntry(
					`${scope}/${config.examplePackageName}`,
					[]
				)
			}
		);
		await this.initializeRepoState.execute(cwd, initialState);

		console.log('\nInstalling dependencies...');
		await this.bunRuntime.installDependencies(cwd);

		console.log('\nMonorepo bootstrapped successfully.');
	}
}
