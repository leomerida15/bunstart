import { InitCommand } from '../../application/InitCommand';
import { SelectTemplateUseCase } from '../../application/use-cases/SelectTemplateUseCase';
import { EnquirerAdapter } from '../adapters/EnquirerAdapter';

/**
 * Factory for creating InitCommand instances with proper dependency injection.
 *
 * This factory encapsulates the wiring of dependencies, following the
 * Dependency Inversion Principle by constructing the dependency graph
 * from the infrastructure layer up to the application layer.
 *
 * @class InitCommandFactory
 */
export class InitCommandFactory {
	/**
	 * Creates a new InitCommand instance with all dependencies properly wired.
	 *
	 * @static
	 * @returns {InitCommand} A fully configured InitCommand instance
	 */
	public static create(): InitCommand {
		const userInterface = new EnquirerAdapter();
		const selectTemplateUseCase = new SelectTemplateUseCase(userInterface);
		return new InitCommand(selectTemplateUseCase);
	}
}
