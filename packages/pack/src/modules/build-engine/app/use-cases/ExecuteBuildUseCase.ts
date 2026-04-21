import type { BundlerPort } from '../../domain/ports/Bundler.port';
import type { BuildConfig } from '../../domain/entities/BuildConfig';
import { BuildError } from '../../../../shared/errors/BuildError';
import { PluginSystemFactory } from '../../../plugin-system/infra/factories/PluginSystemFactory';
import { PluginPhase } from '../../../plugin-system/domain/value-objects/PluginPhase';
import { DtsEmitterFactory } from '../../../dts-emitter/infra/factories/DtsEmitterFactory';

/**
 * Use case that executes a build using the configured bundler,
 * including pre-build and post-build plugin phases.
 */
export class ExecuteBuildUseCase {
	private readonly bundler: BundlerPort;

	public constructor({ bundler }: { bundler: BundlerPort }) {
		this.bundler = bundler;
	}

	async execute(buildConfig: BuildConfig): Promise<void> {
		const registry = PluginSystemFactory.getRegistry();

		// Execute pre-build plugins
		const preBuildPlugins = registry.getByPhase(PluginPhase.fromString('pre-build'));
		for (const pluginDef of preBuildPlugins) {
			if (pluginDef.bunPlugin.hooks?.setup) {
				await pluginDef.bunPlugin.hooks.setup({} as never);
			}
		}

		// Execute main build
		const result = await this.bundler.execute(buildConfig);

		if (!result.success) {
			const messages = result.errors.map((e) => e.message).join('; ');
			throw new BuildError(`Build failed: ${messages}`);
		}

		// Execute post-build plugins
		const postBuildPlugins = registry.getByPhase(PluginPhase.fromString('post-build'));
		for (const pluginDef of postBuildPlugins) {
			if (pluginDef.bunPlugin.hooks?.setup) {
				await pluginDef.bunPlugin.hooks.setup({} as never);
			}
		}

		// Execute DTS emission if enabled
		if (buildConfig.dts?.enable) {
			const dtsUseCase = DtsEmitterFactory.getEmitDtsUseCase();
			const outDir = buildConfig.dts.outDir ?? buildConfig.outdir;
			await dtsUseCase.execute(buildConfig.dts, outDir);
		}
	}
}
