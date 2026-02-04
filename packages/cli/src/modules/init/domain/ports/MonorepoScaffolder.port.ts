import type { MonorepoConfigProps } from '../entities/MonorepoConfig';

/**
 * Port for scaffolding a monorepo structure.
 *
 * @interface MonorepoScaffolderPort
 */
export interface MonorepoScaffolderPort {
	/**
	 * Scaffolds a complete monorepo structure (apps, packages, examples) in cwd.
	 *
	 * @param {MonorepoConfigProps} config - Monorepo configuration
	 * @param {string} cwd - Working directory (project root)
	 * @returns {Promise<void>}
	 */
	scaffold(config: MonorepoConfigProps, cwd: string): Promise<void>;

	/**
	 * Scaffolds a single app directory (apps/<appId>) from templates.
	 * @param cwd - Monorepo root
	 * @param appId - App alias (e.g. 'my-app')
	 * @param scope - Monorepo scope without @ (e.g. 'types')
	 */
	scaffoldApp(cwd: string, appId: string, scope: string): Promise<void>;

	/**
	 * Scaffolds a single package directory (packages/<pkgId>) from templates.
	 * @param cwd - Monorepo root
	 * @param pkgId - Package alias (e.g. 'shared-utils')
	 * @param scope - Monorepo scope without @ (e.g. 'types')
	 */
	scaffoldPackage(cwd: string, pkgId: string, scope: string): Promise<void>;
}
