import type { PackageAnalyzerPort } from '../../domain/ports/PackageAnalyzer.port';
import type { BuildConfig } from '../../domain/entities/BuildConfig';
import type { UserBuildConfig } from './CreateBuildSettingsUseCase';
import { ExternalsResolver } from '../../domain/services/ExternalsResolver';
import { EntryPointResolver } from '../../domain/services/EntryPointResolver';
import { PluginSystemFactory } from '../../../plugin-system/infra/factories/PluginSystemFactory';
import type { ResolvedPlugins } from '../../../plugin-system/app/use-cases/ResolvePluginsUseCase';

/**
 * Use case that resolves a BuildConfig with all dependencies resolved:
 * environment, entrypoints (absolute paths), externals strategy, and plugins.
 */
export class ResolveBuildConfigUseCase {
	private readonly packageAnalyzer: PackageAnalyzerPort;

	public constructor({ packageAnalyzer }: { packageAnalyzer: PackageAnalyzerPort }) {
		this.packageAnalyzer = packageAnalyzer;
	}

	async execute(
		partialConfig: BuildConfig,
		userConfig: UserBuildConfig,
		cwd: string,
	): Promise<BuildConfig> {
		// Resolve entrypoint paths to absolute
		const entryPointResolver = new EntryPointResolver();
		const resolvedEntrypoints = entryPointResolver.resolve(userConfig.entrypoints, cwd);

		// Load package.json for externals resolution
		const packageJson = await this.packageAnalyzer.loadPackageJson(cwd);

		// Resolve externals
		const externalsResolver = new ExternalsResolver();
		const externalStrategy = externalsResolver.resolve(partialConfig, packageJson);

		// Resolve plugins from registry and user config
		const resolvedPlugins = this.resolvePlugins(userConfig.plugins || []);

		return {
			...partialConfig,
			entrypoints: resolvedEntrypoints,
			externals: [...externalStrategy.externals],
			plugins: [
				...resolvedPlugins.preBuild,
				...resolvedPlugins.build,
				...resolvedPlugins.postBuild,
			],
		};
	}

	/**
	 * Resolve plugins from user config and registry.
	 */
	private resolvePlugins(userPlugins: BuildConfig['plugins']): ResolvedPlugins {
		const resolveUseCase = PluginSystemFactory.createResolvePluginsUseCase();
		return resolveUseCase.execute({ userPlugins });
	}
}
