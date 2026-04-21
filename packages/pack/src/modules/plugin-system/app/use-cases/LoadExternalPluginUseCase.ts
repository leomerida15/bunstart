import type { BunPlugin } from '../../../../shared/types/BunPlugin';
import type { PluginLoaderPort } from '../../domain/ports/PluginLoader.port';
import { PluginNotFoundError } from '../../../../shared/errors/PluginNotFoundError';

export interface LoadExternalPluginConfig {
	optionalPlugins?: string[];
	requiredPlugins?: string[];
}

/**
 * Use case for loading external plugins lazily.
 */
export class LoadExternalPluginUseCase {
	constructor(private readonly loader: PluginLoaderPort) {}

	/**
	 * Load optional plugins - warns but doesn't fail if not found.
	 */
	public async loadOptional(pluginNames: string[]): Promise<BunPlugin[]> {
		const results: BunPlugin[] = [];

		for (const name of pluginNames) {
			try {
				const plugin = await this.loader.load(name);
				results.push(plugin);
			} catch (error) {
				if (error instanceof PluginNotFoundError) {
					// Log warning and continue
					console.warn(
						`[plugin-system] Optional plugin not found: ${name}. ${error.suggestion}`,
					);
				} else {
					// Re-throw unexpected errors
					throw error;
				}
			}
		}

		return results;
	}

	/**
	 * Load required plugins - throws if not found.
	 */
	public async loadRequired(pluginNames: string[]): Promise<BunPlugin[]> {
		const results: BunPlugin[] = [];

		for (const name of pluginNames) {
			const plugin = await this.loader.load(name);
			results.push(plugin);
		}

		return results;
	}

	/**
	 * Load plugins based on config - optional warns, required throws.
	 */
	public async execute(config: LoadExternalPluginConfig): Promise<BunPlugin[]> {
		const results: BunPlugin[] = [];

		// Load optional plugins
		if (config.optionalPlugins) {
			const optional = await this.loadOptional(config.optionalPlugins);
			results.push(...optional);
		}

		// Load required plugins
		if (config.requiredPlugins) {
			const required = await this.loadRequired(config.requiredPlugins);
			results.push(...required);
		}

		return results;
	}
}
