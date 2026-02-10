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

	public create(): InitCommand {
		const userInterface = new EnquirerAdapter();
		const selectTemplateUseCase = InitCommandFactory.createSelectTemplateUseCase();

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
		const bootstrapApiRestUseCase = InitCommandFactory.createBootstrapApiRestUseCase();
		const bootstrapFrontendReactUseCase = InitCommandFactory.createBootstrapFrontendReactUseCase();
		const bootstrapLibraryUseCase = InitCommandFactory.createBootstrapLibraryUseCase();


		return new InitCommand({
			userInterface,
			selectTemplateUseCase,
			bootstrapMonorepoUseCase,
			bootstrapApiRestUseCase,
			bootstrapFrontendReactUseCase,
			bootstrapLibraryUseCase
		});
	}

	public static create(): InitCommand {
		return new InitCommandFactory().create();
	}

	public static createSelectTemplateUseCase(): SelectTemplateUseCase {
		const userInterface = new EnquirerAdapter();
		return new SelectTemplateUseCase({ userInterface });
	}

	public static createBootstrapApiRestUseCase(): BootstrapApiRestUseCase {
		const bunRuntime = new BunRuntimeAdapter();
		const applyBunstartRules = InitCommandFactory.createApplyBunstartRulesUseCase();
		return new BootstrapApiRestUseCase({
			bunRuntime,
			applyBunstartRules
		});
	}

	public static createBootstrapFrontendReactUseCase(): BootstrapFrontendReactUseCase {
		const bunRuntime = new BunRuntimeAdapter();
		const userInterface = new EnquirerAdapter();
		const filesystem = new NodeFilesystemAdapter();
		const applyBunstartRules = InitCommandFactory.createApplyBunstartRulesUseCase();
		return new BootstrapFrontendReactUseCase({
			bunRuntime,
			userInterface,
			filesystem,
			applyBunstartRules
		});
	}

	public static createBootstrapLibraryUseCase(): BootstrapLibraryUseCase {
		const bunRuntime = new BunRuntimeAdapter();
		const applyBunstartRules = InitCommandFactory.createApplyBunstartRulesUseCase();
		return new BootstrapLibraryUseCase({
			bunRuntime,
			applyBunstartRules
		});
	}
}
