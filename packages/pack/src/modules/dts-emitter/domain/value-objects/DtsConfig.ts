/**
 * Configuration for TypeScript declaration file emission.
 */
export interface DtsConfig {
	/**
	 * Whether to emit .d.ts files during build.
	 */
	enable: boolean;
	/**
	 * Entry points to generate type declarations for.
	 * Defaults to ["./src/index.ts"] if not provided.
	 */
	entrypoints?: string[];
	/**
	 * Output directory for generated .d.ts files.
	 * Defaults to the build output directory if not provided.
	 */
	outDir?: string;
}

/**
 * Creates a DtsConfig with default values.
 * @param config - The user-provided config
 * @returns A complete DtsConfig with defaults applied
 */
export function createDtsConfig(config: Partial<DtsConfig> | undefined): DtsConfig | undefined {
	if (config === undefined) {
		return undefined;
	}
	return {
		enable: config.enable ?? false,
		entrypoints: config.entrypoints ?? ['./src/index.ts'],
		outDir: config.outDir,
	};
}
