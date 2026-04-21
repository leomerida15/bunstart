/**
 * Plugin phase — identifies when a plugin should execute in the build lifecycle.
 */
export class PluginPhase {
	private constructor(private readonly _value: 'pre-build' | 'build' | 'post-build') {}

	public get value(): string {
		return this._value;
	}

	public toString(): string {
		return this._value;
	}

	public equals(other: PluginPhase): boolean {
		return this._value === other._value;
	}

	public static fromString(value: string): PluginPhase {
		if (value !== 'pre-build' && value !== 'build' && value !== 'post-build') {
			throw new Error(
				`Invalid plugin phase: ${value}. Valid values are "pre-build", "build", or "post-build".`,
			);
		}
		return new PluginPhase(value);
	}
}
