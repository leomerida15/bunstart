import type { BunPlugin } from '../../../../shared/types/BunPlugin';

/**
 * Service for validating BunPlugin shape.
 */
export class PluginValidator {
	/**
	 * Validates that a BunPlugin has the required properties.
	 * @throws Error if the plugin is invalid
	 */
	public validate(plugin: BunPlugin): void {
		if (!plugin) {
			throw new Error('Plugin is undefined or null');
		}

		if (typeof plugin.name !== 'string' || plugin.name.trim() === '') {
			throw new Error('Plugin must have a non-empty name');
		}

		if (plugin.hooks === undefined) {
			throw new Error(`Plugin "${plugin.name}" must have hooks defined`);
		}
	}

	/**
	 * Checks if a plugin is valid without throwing.
	 */
	public isValid(plugin: BunPlugin): boolean {
		try {
			this.validate(plugin);
			return true;
		} catch {
			return false;
		}
	}
}
