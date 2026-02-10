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

export interface InitCommandOptions {
	name?: string;
	template?: string;
	cwd?: string;
}

export interface InitCommandResult {
	completed: boolean;
}

/**
 * Command for initializing a new project.
 *
 * This command orchestrates the project initialization workflow by:
 * 1. Prompting the user to select a project template (or using provided option)
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

	public async execute(options?: InitCommandOptions): Promise<InitCommandResult> {
		console.log('\n🚀 Initializing new project...\n');

		// 1. Determine template
		let selectedTemplate;
		if (options?.template) {
			// Mock a template object based on the string
			// In a real scenario, we might want to validate this against available templates
			// For now, we assume valid input from internal calls
			selectedTemplate = {
				name: options.template,
				type: { value: options.template, label: options.template },
				description: '',
				color: '#000000'
			};
		} else {
			selectedTemplate = await this.selectTemplateUseCase.execute();
		}

		if (!selectedTemplate) {
			console.log('\nOperation cancelled.');
			return { completed: false };
		}

		console.log(`\nSelected template: ${selectedTemplate.name}`);

		// 2. Determine target directory and project name
		const cwd = options?.cwd ? options.cwd : process.cwd();
		let projectName = options?.name;

		if (!projectName) {
			const name = await this.userInterface.promptProjectName(
				'Project name:',
				basename(cwd)
			);
			if (!name) {
				console.log('\nOperation cancelled.');
				return { completed: false };
			}
			projectName = name;
		}

		// 3. Execute bootstrap based on template type
		if (selectedTemplate.type.value === 'monorepo') {
			await this.bootstrapMonorepoUseCase.execute(cwd, { projectName });
			return { completed: true };
		}

		if (selectedTemplate.type.value === 'api-rest') {
			await this.bootstrapApiRestUseCase.execute(cwd, projectName);
			return { completed: true };
		}

		if (selectedTemplate.type.value === 'frontend-react') {
			await this.bootstrapFrontendReactUseCase.execute(cwd, projectName);
			return { completed: true };
		}

		if (selectedTemplate.type.value === 'library') {
			await this.bootstrapLibraryUseCase.execute(cwd, projectName);
			return { completed: true };
		}

		console.log('Configuring project...');
		// Other template types: future implementation
		return { completed: true };
	}
}
