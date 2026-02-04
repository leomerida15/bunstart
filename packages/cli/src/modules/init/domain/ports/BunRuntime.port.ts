/**
 * Port for Bun runtime operations (init, run, etc.).
 *
 * @interface BunRuntimePort
 */
export interface BunRuntimePort {
	/**
	 * Initializes a blank Bun project in the given directory.
	 *
	 * @param {string} cwd - Working directory
	 * @returns {Promise<void>}
	 */
	initBlank(cwd: string): Promise<void>;

	/**
	 * Installs dependencies in the given directory.
	 *
	 * @param {string} cwd - Working directory
	 * @returns {Promise<void>}
	 */
	installDependencies(cwd: string): Promise<void>;
}
