import { MonorepoAlias } from '../value-objects/MonorepoAlias';

export interface MonorepoConfigProps {
	alias: MonorepoAlias;
	examplePackageName?: string;
	exampleAppName?: string;
}

/**
 * Configuration for a bootstrapped monorepo.
 *
 * @class MonorepoConfig
 */
export class MonorepoConfig {
	public readonly alias: MonorepoAlias;
	public readonly workspaces: readonly [string, string] = ['apps/*', 'packages/*'];
	public readonly examplePackageName = 'pkg-example';
	public readonly exampleAppName = 'app-example';

	private constructor({ alias }: MonorepoConfigProps) {
		this.alias = alias;
	}

	/**
	 * Creates a MonorepoConfig for the given alias.
	 *
	 * @param {MonorepoConfigProps} {alias}
	 * @returns {MonorepoConfigProps}
	 */
	public static create({ alias }: MonorepoConfigProps): MonorepoConfig {
		return new MonorepoConfig({ alias });
	}
}
