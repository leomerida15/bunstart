import type { PluginDefinition } from '../entities/PluginDefinition';

/**
 * Service for sorting plugins by priority.
 */
export class PluginOrderResolver {
	/**
	 * Sort plugins by priority ascending (lower numbers run first).
	 */
	public sort(plugins: PluginDefinition[]): PluginDefinition[] {
		return [...plugins].sort((a, b) => a.priority - b.priority);
	}

	/**
	 * Sort plugins by priority descending (higher numbers run first).
	 */
	public sortDesc(plugins: PluginDefinition[]): PluginDefinition[] {
		return [...plugins].sort((a, b) => b.priority - a.priority);
	}
}
