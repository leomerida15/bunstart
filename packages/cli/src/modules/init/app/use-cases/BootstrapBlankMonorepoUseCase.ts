import { MonorepoConfig } from '../../domain/entities/MonorepoConfig';
import { MonorepoAlias } from '../../domain/value-objects/MonorepoAlias';
import type { BunRuntimePort } from '../../domain/ports/BunRuntime.port';
import type { MonorepoScaffolderPort } from '../../domain/ports/MonorepoScaffolder.port';
import type { UserInterfacePort } from '../../domain/ports/UserInterface.port';
import { createAppEntry } from '../../../mono/domain/entities/AppEntry';
import { createPackageEntry } from '../../../mono/domain/entities/PackageEntry';
import { createRepoConfig } from '../../../mono/domain/entities/RepoConfig';
import type { BunstartConfig } from '../../../config-state/domain/entities/BunstartConfig';
import type { InitializeConfigUseCase } from '../../../config-state/app/use-cases/InitializeConfigUseCase';

export interface BootstrapBlankMonorepoUseCaseProps {
	bunRuntime: BunRuntimePort;
	userInterface: UserInterfacePort;
	scaffolder: MonorepoScaffolderPort;
	initializeConfig: InitializeConfigUseCase;
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
	private readonly initializeConfig: InitializeConfigUseCase;

	constructor({
		bunRuntime,
		userInterface,
		scaffolder,
		initializeConfig
	}: BootstrapBlankMonorepoUseCaseProps) {
		this.bunRuntime = bunRuntime;
		this.userInterface = userInterface;
		this.scaffolder = scaffolder;
		this.initializeConfig = initializeConfig;
	}

	public async execute(
		cwd: string,
		options: { projectName: string }
	): Promise<void> {
		console.log('\nRunning bun init...');
		await this.bunRuntime.initBlank(cwd);

		const aliasInput = await this.userInterface.askAlias(
			'Monorepo alias (e.g. myorg or @myorg):',
			options.projectName
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
		const initialState = createRepoConfig(
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
		const bunstartConfig: BunstartConfig = {
			repo: { apps: initialState.apps, packages: initialState.packages }
		};
		await this.initializeConfig.execute(cwd, bunstartConfig);

		console.log('\nInstalling dependencies...');
		await this.bunRuntime.installDependencies(cwd);

		console.log('\nMonorepo bootstrapped successfully.');
	}
}
