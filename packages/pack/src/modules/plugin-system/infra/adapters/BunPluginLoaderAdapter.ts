import type { BunPlugin } from '../../../../shared/types/BunPlugin';
import type { PluginLoaderPort } from '../../domain/ports/PluginLoader.port';
import { PluginNotFoundError } from '../../../../shared/errors/PluginNotFoundError';

/**
 * Adapter for loading Bun plugins via dynamic import.
 */
export class BunPluginLoaderAdapter implements PluginLoaderPort {
	/**
	 * Load a plugin by package name using dynamic import.
	 * @throws PluginNotFoundError if the plugin cannot be loaded
	 */
	public async load(pluginName: string): Promise<BunPlugin> {
		try {
			const module = await import(pluginName);
			// Most plugins export a default BunPlugin or named export
			const plugin = module.default || module;
			return plugin as BunPlugin;
		} catch (error: unknown) {
			// Check if it's a "module not found" type error
			const errorMessage = error instanceof Error ? error.message : String(error);

			if (
				errorMessage.includes('MODULE_NOT_FOUND') ||
				errorMessage.includes('Cannot find module') ||
				errorMessage.includes("Cannot find package '@")
			) {
				throw new PluginNotFoundError(
					pluginName,
					`Run \`bun install ${pluginName}\` to install.`,
				);
			}

			// Re-throw other errors (e.g., syntax errors in the plugin)
			throw error;
		}
	}
}
