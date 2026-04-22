/**
 * Error thrown when a requested plugin cannot be loaded.
 */
export class PluginNotFoundError extends Error {
	public constructor(
		public readonly pluginName: string,
		public readonly suggestion: string,
	) {
		super(`Plugin not found: ${pluginName}. ${suggestion}`);
		this.name = 'PluginNotFoundError';
	}
}
