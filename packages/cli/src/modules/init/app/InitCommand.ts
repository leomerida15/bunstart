import { SelectTemplateUseCase } from './use-cases/SelectTemplateUseCase';
import type { BootstrapBlankMonorepoUseCase } from './use-cases/BootstrapBlankMonorepoUseCase';

export interface InitCommandProps {
	selectTemplateUseCase: SelectTemplateUseCase;
	bootstrapMonorepoUseCase: BootstrapBlankMonorepoUseCase;
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
	private readonly selectTemplateUseCase: SelectTemplateUseCase;
	private readonly bootstrapMonorepoUseCase: BootstrapBlankMonorepoUseCase;

	constructor({
		selectTemplateUseCase,
		bootstrapMonorepoUseCase
	}: InitCommandProps) {
		this.selectTemplateUseCase = selectTemplateUseCase;
		this.bootstrapMonorepoUseCase = bootstrapMonorepoUseCase;
	}

	public async execute(): Promise<void> {
		console.log('\n🚀 Initializing new project...\n');

		const selectedTemplate = await this.selectTemplateUseCase.execute();

		if (!selectedTemplate) {
			console.log('\nOperation cancelled.');
			return;
		}

		console.log(`\nSelected template: ${selectedTemplate.name}`);

		if (selectedTemplate.type.value === 'monorepo') {
			await this.bootstrapMonorepoUseCase.execute(process.cwd());
			return;
		}

		console.log('Configuring project...');
		// Other template types: future implementation
	}
}
