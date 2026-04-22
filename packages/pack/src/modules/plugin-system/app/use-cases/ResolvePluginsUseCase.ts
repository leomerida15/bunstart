import type { BunPlugin } from '../../../../shared/types/BunPlugin';
import { PluginPhase } from '../../domain/value-objects/PluginPhase';
import type { PluginDefinition } from '../../domain/entities/PluginDefinition';
import { PluginRegistry } from '../../domain/entities/PluginRegistry';
import { PluginOrderResolver } from '../../domain/services/PluginOrderResolver';
import type { PluginLoaderPort } from '../../domain/ports/PluginLoader.port';
import { PluginNotFoundError } from '../../../../shared/errors/PluginNotFoundError';

export interface ResolvedPlugins {
	preBuild: BunPlugin[];
	build: BunPlugin[];
	postBuild: BunPlugin[];
}

export interface ResolvePluginsInput {
	userPlugins: BunPlugin[];
	optionalPlugins?: string[];
	loader?: PluginLoaderPort;
}

/**
 * Use case for resolving plugins from user config and registry.
 */
export class ResolvePluginsUseCase {
	constructor(
		private readonly registry: PluginRegistry,
		private readonly orderResolver: PluginOrderResolver = new PluginOrderResolver(),
	) {}

	/**
	 * Resolve plugins by merging user plugins with registered plugins.
	 * Returns plugins organized by phase.
	 */
	public execute(input: ResolvePluginsInput): ResolvedPlugins {
		// Get internal plugins by phase
		const internalPreBuild = this.orderResolver.sort(
			this.registry.getByPhase(PluginPhase.fromString('pre-build')),
		);
		const internalBuild = this.orderResolver.sort(
			this.registry.getByPhase(PluginPhase.fromString('build')),
		);
		const internalPostBuild = this.orderResolver.sort(
			this.registry.getByPhase(PluginPhase.fromString('post-build')),
		);

		// Merge user plugins into appropriate phases
		// User plugins are assumed to be "build" phase by default
		const userBuildPlugins = input.userPlugins.filter((p) => p);

		// Combine internal + user plugins for each phase
		return {
			preBuild: internalPreBuild.map((def: PluginDefinition) => def.bunPlugin),
			build: [
				...internalBuild.map((def: PluginDefinition) => def.bunPlugin),
				...userBuildPlugins,
			],
			postBuild: internalPostBuild.map((def: PluginDefinition) => def.bunPlugin),
		};
	}

	/**
	 * Resolve external plugins that need lazy loading.
	 */
	public async resolveExternal(
		pluginNames: string[],
		loader: PluginLoaderPort,
	): Promise<BunPlugin[]> {
		const results: BunPlugin[] = [];

		for (const name of pluginNames) {
			try {
				const plugin = await loader.load(name);
				results.push(plugin);
			} catch (error) {
				// If it's a PluginNotFoundError, we might want to warn but continue
				if (error instanceof PluginNotFoundError) {
					console.warn(`[plugin-system] ${error.message}`);
				}
				// For other errors, re-throw
				throw error;
			}
		}

		return results;
	}
}
