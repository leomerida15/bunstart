import type { BunPlugin } from '../../../../shared/types/BunPlugin';

/**
 * Port interface for loading plugins dynamically.
 */
export interface PluginLoaderPort {
	/**
	 * Load a plugin by its package name.
	 * @throws PluginNotFoundError if the plugin cannot be loaded
	 */
	load(pluginName: string): Promise<BunPlugin>;
}
