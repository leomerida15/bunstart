import { BunBuildAdapter } from '../adapters/BunBuildAdapter';
import { PackageJsonAnalyzerAdapter } from '../adapters/PackageJsonAnalyzerAdapter';
import { ExecuteBuildUseCase } from '../../app/use-cases/ExecuteBuildUseCase';
import { ResolveBuildConfigUseCase } from '../../app/use-cases/ResolveBuildConfigUseCase';
import { CreateBuildSettingsUseCase } from '../../app/use-cases/CreateBuildSettingsUseCase';

/**
 * Factory for build-engine use cases with default adapter instances.
 */
export class BuildEngineFactory {
	private static readonly bundler = new BunBuildAdapter();
	private static readonly packageAnalyzer = new PackageJsonAnalyzerAdapter();

	static createExecuteBuildUseCase(): ExecuteBuildUseCase {
		return new ExecuteBuildUseCase({ bundler: this.bundler });
	}

	static createResolveBuildConfigUseCase(): ResolveBuildConfigUseCase {
		return new ResolveBuildConfigUseCase({ packageAnalyzer: this.packageAnalyzer });
	}

	static createCreateBuildSettingsUseCase(): CreateBuildSettingsUseCase {
		return new CreateBuildSettingsUseCase({ packageAnalyzer: this.packageAnalyzer });
	}
}
