import { InitCommand } from '../../app/InitCommand';
import { ApplyBunstartRulesUseCase } from '../../app/use-cases/ApplyBunstartRulesUseCase';
import { BootstrapApiRestUseCase } from '../../app/use-cases/BootstrapApiRestUseCase';
import { BootstrapBlankMonorepoUseCase } from '../../app/use-cases/BootstrapBlankMonorepoUseCase';
import { BootstrapFrontendReactUseCase } from '../../app/use-cases/BootstrapFrontendReactUseCase';
import { BootstrapLibraryUseCase } from '../../app/use-cases/BootstrapLibraryUseCase';
import { SelectTemplateUseCase } from '../../app/use-cases/SelectTemplateUseCase';
import { ConfigUseCasesFactory } from '../../../config-state/infra/factories/ConfigUseCasesFactory';
import { ApplyBunstartRulesAdapter } from '../adapters/ApplyBunstartRulesAdapter';
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
	/**
	 * Creates ApplyBunstartRulesUseCase for use by Bootstrap* use cases (e.g. BootstrapApiRestUseCase).
	 */
	public static createApplyBunstartRulesUseCase(): ApplyBunstartRulesUseCase {
		const filesystem = new NodeFilesystemAdapter();
		const packageJson = new PackageJsonAdapter();
		const applyBunstartRulesAdapter = new ApplyBunstartRulesAdapter({
			filesystem,
			packageJson
		});
		return new ApplyBunstartRulesUseCase({
			applyBunstartRules: applyBunstartRulesAdapter
		});
	}

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

		const applyBunstartRulesUseCase = InitCommandFactory.createApplyBunstartRulesUseCase();
		const bootstrapApiRestUseCase = new BootstrapApiRestUseCase({
			bunRuntime,
			applyBunstartRules: applyBunstartRulesUseCase
		});
		const bootstrapFrontendReactUseCase = new BootstrapFrontendReactUseCase({
			bunRuntime,
			userInterface,
			filesystem,
			applyBunstartRules: applyBunstartRulesUseCase
		});
		const bootstrapLibraryUseCase = new BootstrapLibraryUseCase({
			bunRuntime,
			applyBunstartRules: applyBunstartRulesUseCase
		});

		return new InitCommand({
			userInterface,
			selectTemplateUseCase,
			bootstrapMonorepoUseCase,
			bootstrapApiRestUseCase,
			bootstrapFrontendReactUseCase,
			bootstrapLibraryUseCase
		});
	}
}
