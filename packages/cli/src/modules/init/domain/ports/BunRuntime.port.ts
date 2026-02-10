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
	 * Initializes a React project in the given directory (clean, Tailwind, or shadcn variant).
	 *
	 * @param {string} cwd - Working directory
	 * @param {'react' | 'tailwind' | 'shadcn'} variant - React template variant
	 * @returns {Promise<void>}
	 */
	initReact(
		cwd: string,
		variant: 'react' | 'tailwind' | 'shadcn'
	): Promise<void>;

	/**
	 * Initializes a library-style Bun project in the given directory.
	 *
	 * @param {string} cwd - Working directory
	 * @returns {Promise<void>}
	 */
	initLibrary(cwd: string): Promise<void>;

	/**
	 * Installs dependencies in the given directory.
	 *
	 * @param {string} cwd - Working directory
	 * @returns {Promise<void>}
	 */
	installDependencies(cwd: string): Promise<void>;
}
