import { Template } from '../../domain/entities/Template';
import type { UserInterfacePort } from '../../domain/ports/UserInterface.port';
import { TemplateDefinitions } from '../../domain/services/TemplateDefinitions';

export interface SelectTemplateUseCaseProps {
	userInterface: UserInterfacePort;
}

/**
 * Use case for selecting a project template.
 *
 * This use case orchestrates the template selection process by:
 * 1. Retrieving all available templates
 * 2. Prompting the user to select one via the user interface
 * 3. Returning the selected template or handling cancellation
 *
 * Following the Single Responsibility Principle, this use case
 * focuses solely on the template selection workflow.
 *
 * @class SelectTemplateUseCase
 */
export class SelectTemplateUseCase {
	/**
	 * The user interface port for prompting the user.
	 *
	 * @private
	 * @readonly
	 */
	private readonly userInterface: UserInterfacePort;

	/**
	 * Creates a new SelectTemplateUseCase instance.
	 *
	 * @param {SelectTemplateUseCaseProps} props - The dependencies
	 */
	constructor({ userInterface }: SelectTemplateUseCaseProps) {
		this.userInterface = userInterface;
	}

	/**
	 * Executes the template selection use case.
	 *
	 * @param {string} [message='Select project template:'] - The prompt message to display
	 * @returns {Promise<Template | null>} The selected template, or null if cancelled
	 * @throws {Error} If the selection process fails
	 */
	public async execute(
		message: string = 'Select project template:'
	): Promise<Template | null> {
		const templates = TemplateDefinitions.getAllTemplates();

		const result = await this.userInterface.selectTemplate(templates, message);

		if (result.cancelled) {
			return null;
		}

		return result.template;
	}
}
