import { Template } from '../entities/Template';

/**
 * Result of confirming build scripts generation.
 *
 * @interface BuildScriptsConfirmation
 */
export interface BuildScriptsConfirmation {
	/** Whether to generate bunstart.build.ts and bunstart.watch.ts */
	shouldGenerate: boolean;
}

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

	/**
	 * Prompts the user to enter a monorepo alias.
	 *
	 * @param {string} [message] - The prompt message to display
	 * @param {string} [initial] - Initial value for the input
	 * @returns {Promise<string | null>} The alias string, or null if cancelled
	 */
	askAlias(message?: string, initial?: string): Promise<string | null>;

	/**
	 * Prompts the user to enter the project name.
	 *
	 * @param {string} [message] - The prompt message to display
	 * @param {string} [defaultName] - Default value (e.g. current directory name)
	 * @returns {Promise<string | null>} The project name, or null if cancelled
	 */
	promptProjectName(
		message?: string,
		defaultName?: string
	): Promise<string | null>;

	/**
	 * Prompts the user to select a React variant (clean, Tailwind, or shadcn).
	 *
	 * @param {string} [message] - The prompt message to display
	 * @returns {Promise<'react' | 'tailwind' | 'shadcn' | null>} The selected variant, or null if cancelled
	 */
	selectReactVariant(
		message?: string
	): Promise<'react' | 'tailwind' | 'shadcn' | null>;

	/**
	 * Prompts the user to confirm if they want to generate bunstart.build.ts
	 * and bunstart.watch.ts scripts.
	 *
	 * @param {string} [message] - The prompt message to display
	 * @returns {Promise<BuildScriptsConfirmation>} The user's choice
	 */
	confirmGenerateBuildScripts(
		message?: string
	): Promise<BuildScriptsConfirmation>;
}
