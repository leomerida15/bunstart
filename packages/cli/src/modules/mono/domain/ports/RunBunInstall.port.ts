/**
 * Port for running `bun install` in a directory (typically monorepo root).
 */
export interface RunBunInstallPort {
	/**
	 * Executes `bun install` in the given directory.
	 * @param cwd - Directory to run install in (e.g. monorepo root)
	 */
	execute(cwd: string): Promise<void>;
}
