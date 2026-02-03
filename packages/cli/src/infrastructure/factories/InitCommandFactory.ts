import { InitCommand } from '../../command/init/init';
import { SelectTemplateUseCase } from '../../application/use-cases/init/SelectTemplateUseCase';
import { EnquirerAdapter } from '../adapters/ui/EnquirerAdapter';

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
        // Create infrastructure adapter
        const userInterface = new EnquirerAdapter();
        
        // Create use case with adapter
        const selectTemplateUseCase = new SelectTemplateUseCase(userInterface);
        
        // Create command with use case
        return new InitCommand(selectTemplateUseCase);
    }
}
