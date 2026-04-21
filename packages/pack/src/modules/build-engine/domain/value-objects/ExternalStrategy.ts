/**
 * Resolved external modules based on build environment strategy.
 * - Development: all dependencies + devDependencies from package.json
 * - Production: only user-provided externals
 */
export class ExternalStrategy {
	private constructor(private readonly _externals: readonly string[]) {}

	/**
	 * Creates an ExternalStrategy from a list of externals.
	 */
	public static fromList(externals: readonly string[]): ExternalStrategy {
		return new ExternalStrategy([...externals]);
	}

	public get externals(): readonly string[] {
		return this._externals;
	}

	public toString(): string {
		return this._externals.join(', ');
	}
}
