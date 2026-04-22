/**
 * Type declarations for optional dependency bun-plugin-dts.
 * This module only exists to satisfy TypeScript when the package is not installed.
 * At runtime, the import will fail gracefully if the package is not present.
 */
declare module 'bun-plugin-dts' {
	interface DtsPluginOptions {
		entrypoints?: string[];
		outDir?: string;
		verbose?: boolean;
	}

	interface DtsPlugin {
		/** Plugin name */
		name: string;
		/** Plugin hooks for Bun */
		hooks?: {
			setup?: (build: unknown) => void | Promise<void>;
		};
	}

	function dts(options?: DtsPluginOptions): DtsPlugin;

	export default dts;
	export { DtsPlugin, DtsPluginOptions };
}
