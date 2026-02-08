import { basename } from 'node:path';
import type { UserInterfacePort } from '../domain/ports/UserInterface.port';
import { SelectTemplateUseCase } from './use-cases/SelectTemplateUseCase';
import type { BootstrapApiRestUseCase } from './use-cases/BootstrapApiRestUseCase';
import type { BootstrapBlankMonorepoUseCase } from './use-cases/BootstrapBlankMonorepoUseCase';
import type { BootstrapFrontendReactUseCase } from './use-cases/BootstrapFrontendReactUseCase';
import type { BootstrapLibraryUseCase } from './use-cases/BootstrapLibraryUseCase';

export interface InitCommandProps {
	userInterface: UserInterfacePort;
	selectTemplateUseCase: SelectTemplateUseCase;
	bootstrapMonorepoUseCase: BootstrapBlankMonorepoUseCase;
	bootstrapApiRestUseCase: BootstrapApiRestUseCase;
	bootstrapFrontendReactUseCase: BootstrapFrontendReactUseCase;
	bootstrapLibraryUseCase: BootstrapLibraryUseCase;
}

/**
 * Command for initializing a new project.
 *
 * This command orchestrates the project initialization workflow by:
 * 1. Prompting the user to select a project template
 * 2. Processing the selected template (scaffolding)
 *
 * Following the Dependency Inversion Principle, this command depends on
 * abstractions (use cases) rather than concrete implementations.
 *
 * @class InitCommand
 */
export class InitCommand {
	private readonly userInterface: UserInterfacePort;
	private readonly selectTemplateUseCase: SelectTemplateUseCase;
	private readonly bootstrapMonorepoUseCase: BootstrapBlankMonorepoUseCase;
	private readonly bootstrapApiRestUseCase: BootstrapApiRestUseCase;
	private readonly bootstrapFrontendReactUseCase: BootstrapFrontendReactUseCase;
	private readonly bootstrapLibraryUseCase: BootstrapLibraryUseCase;

	constructor({
		userInterface,
		selectTemplateUseCase,
		bootstrapMonorepoUseCase,
		bootstrapApiRestUseCase,
		bootstrapFrontendReactUseCase,
		bootstrapLibraryUseCase
	}: InitCommandProps) {
		this.userInterface = userInterface;
		this.selectTemplateUseCase = selectTemplateUseCase;
		this.bootstrapMonorepoUseCase = bootstrapMonorepoUseCase;
		this.bootstrapApiRestUseCase = bootstrapApiRestUseCase;
		this.bootstrapFrontendReactUseCase = bootstrapFrontendReactUseCase;
		this.bootstrapLibraryUseCase = bootstrapLibraryUseCase;
	}

	public async execute(targetDir?: string): Promise<void> {
		console.log('\n🚀 Initializing new project...\n');

		const selectedTemplate = await this.selectTemplateUseCase.execute();

		if (!selectedTemplate) {
			console.log('\nOperation cancelled.');
			return;
		}

		console.log(`\nSelected template: ${selectedTemplate.name}`);

		const cwd = targetDir ? targetDir : process.cwd();
		const projectName = await this.userInterface.promptProjectName(
			'Project name:',
			basename(cwd)
		);
		if (projectName === null) {
			console.log('\nOperation cancelled.');
			return;
		}

		if (selectedTemplate.type.value === 'monorepo') {
			await this.bootstrapMonorepoUseCase.execute(cwd, { projectName });
			return;
		}

		if (selectedTemplate.type.value === 'api-rest') {
			await this.bootstrapApiRestUseCase.execute(cwd, projectName);
			return;
		}

		if (selectedTemplate.type.value === 'frontend-react') {
			await this.bootstrapFrontendReactUseCase.execute(cwd, projectName);
			return;
		}

		if (selectedTemplate.type.value === 'library') {
			await this.bootstrapLibraryUseCase.execute(cwd, projectName);
			return;
		}

		console.log('Configuring project...');
		// Other template types: future implementation
	}
}
