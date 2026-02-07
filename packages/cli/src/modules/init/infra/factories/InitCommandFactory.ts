import { InitCommand } from '../../app/InitCommand';
import { BootstrapBlankMonorepoUseCase } from '../../app/use-cases/BootstrapBlankMonorepoUseCase';
import { SelectTemplateUseCase } from '../../app/use-cases/SelectTemplateUseCase';
import { ConfigUseCasesFactory } from '../../../config-state/infra/factories/ConfigUseCasesFactory';
import { BunRuntimeAdapter } from '../adapters/BunRuntimeAdapter';
import { EnquirerAdapter } from '../adapters/EnquirerAdapter';
import { NodeFilesystemAdapter } from '../adapters/NodeFilesystemAdapter';
import { MonorepoScaffolderAdapter } from '../adapters/MonorepoScaffolderAdapter';
import { PackageJsonAdapter } from '../adapters/PackageJsonAdapter';

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
	public static create(): InitCommand {
		const userInterface = new EnquirerAdapter();
		const selectTemplateUseCase = new SelectTemplateUseCase({ userInterface });

		const filesystem = new NodeFilesystemAdapter();
		const packageJson = new PackageJsonAdapter();
		const scaffolder = new MonorepoScaffolderAdapter({ filesystem, packageJson });
		const bunRuntime = new BunRuntimeAdapter();
		const initializeConfig =
			ConfigUseCasesFactory.createInitializeConfigUseCase();
		const bootstrapMonorepoUseCase = new BootstrapBlankMonorepoUseCase({
			bunRuntime,
			userInterface,
			scaffolder,
			initializeConfig
		});

		return new InitCommand({
			selectTemplateUseCase,
			bootstrapMonorepoUseCase
		});
	}
}
