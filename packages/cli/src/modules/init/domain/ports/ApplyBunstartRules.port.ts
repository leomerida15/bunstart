/**
 * Port for applying bunstart rules to a single-package project.
 *
 * Rules: move entry to src/, add bunstart.build.ts and bunstart.watch.ts,
 * patch package.json with scripts and module/main/types.
 *
 * @interface ApplyBunstartRulesPort
 */
export interface ApplyBunstartRulesPort {
	/**
	 * Applies bunstart rules in the given directory.
	 *
	 * @param {string} cwd - Working directory (project root)
	 * @param {object} [options] - Optional: entryExt for ts vs tsx
	 * @returns {Promise<void>}
	 */
	execute(
		cwd: string,
		options?: {
			entryExt?: 'ts' | 'tsx';
			projectName?: string;
			projectType?: 'backend' | 'frontend';
			startCommand?: string;
		}
	): Promise<void>;
}
