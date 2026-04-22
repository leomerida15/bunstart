/**
 * Auto-detected build environment.
 * Detects from NODE_ENV or BUN_ENV, defaults to "development".
 */
export class BuildEnvironment {
	private constructor(private readonly _value: 'development' | 'production') {}

	public get value(): string {
		return this._value;
	}

	public toString(): string {
		return this._value;
	}

	public equals(other: BuildEnvironment): boolean {
		return this._value === other._value;
	}

	/**
	 * Auto-detects environment from environment variables.
	 * NODE_ENV takes precedence over BUN_ENV.
	 * Defaults to "development" if neither is set.
	 */
	public static autoDetect(): BuildEnvironment {
		const nodeEnv = process.env['NODE_ENV'];
		if (nodeEnv === 'production') return new BuildEnvironment('production');
		if (nodeEnv === 'development') return new BuildEnvironment('development');

		const bunEnv = process.env['BUN_ENV'];
		if (bunEnv === 'production') return new BuildEnvironment('production');
		if (bunEnv === 'development') return new BuildEnvironment('development');

		return new BuildEnvironment('development');
	}

	public static fromString(value: string): BuildEnvironment {
		if (value !== 'development' && value !== 'production') {
			throw new Error(
				`Invalid build environment: ${value}. Valid values are "development" or "production".`,
			);
		}
		return new BuildEnvironment(value);
	}
}
