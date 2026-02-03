import { Template } from '../entities/Template';

/**
 * Result of a user selection prompt.
 *
 * @interface SelectionResult
 */
export interface SelectionResult {
	/** The selected template, or null if cancelled */
	template: Template | null;
	/** Whether the user cancelled the selection */
	cancelled: boolean;
}

/**
 * Port interface for user interface interactions.
 *
 * This port defines the contract for user interaction operations,
 * allowing the application layer to interact with users without
 * depending on specific UI implementation details.
 *
 * Following the Dependency Inversion Principle, this interface
 * is defined in the domain layer, and implementations are provided
 * by the infrastructure layer.
 *
 * @interface UserInterfacePort
 */
export interface UserInterfacePort {
	/**
	 * Prompts the user to select a template from a list of available templates.
	 *
	 * @param {Template[]} templates - Array of available templates to choose from
	 * @param {string} message - The prompt message to display
	 * @returns {Promise<SelectionResult>} The selected template or cancellation status
	 * @throws {Error} If the prompt operation fails
	 */
	selectTemplate(templates: Template[], message: string): Promise<SelectionResult>;
}
