import { SelectTemplateUseCase } from './use-cases/SelectTemplateUseCase';

/**
 * Command for initializing a new project.
 *
 * This command orchestrates the project initialization workflow by:
 * 1. Prompting the user to select a project template
 * 2. Processing the selected template (future: scaffolding project structure)
 *
 * Following the Dependency Inversion Principle, this command depends on
 * abstractions (use cases) rather than concrete implementations.
 *
 * @class InitCommand
 */
export class InitCommand {
	/**
	 * The use case for selecting a template.
	 *
	 * @private
	 * @readonly
	 */
	private readonly selectTemplateUseCase: SelectTemplateUseCase;

	/**
	 * Creates a new InitCommand instance.
	 *
	 * @param {SelectTemplateUseCase} selectTemplateUseCase - The use case for template selection
	 */
	constructor(selectTemplateUseCase: SelectTemplateUseCase) {
		this.selectTemplateUseCase = selectTemplateUseCase;
	}

	/**
	 * Executes the init command.
	 *
	 * This method orchestrates the project initialization process by:
	 * 1. Displaying an initialization message
	 * 2. Prompting the user to select a template
	 * 3. Processing the selected template (future implementation)
	 *
	 * @returns {Promise<void>}
	 * @throws {Error} If template selection or project initialization fails
	 */
	public async execute(): Promise<void> {
		console.log('\n🚀 Initializing new project...\n');

		const selectedTemplate = await this.selectTemplateUseCase.execute();

		if (!selectedTemplate) {
			console.log('\nOperation cancelled.');
			return;
		}

		console.log(`\nSelected template: ${selectedTemplate.name}`);
		console.log('Configuring project...');

		// Next step: Integration with bun init and template scaffolding
		// This will be implemented in subsequent tasks
	}
}
