/**
 * Plugin type — identifies if a plugin is internal (bundled), external (user-provided), or dts (TypeScript declaration).
 * Value object that enforces valid values: "internal", "external", or "dts".
 */
export class PluginType {
	private constructor(private readonly _value: 'internal' | 'external' | 'dts') {}

	public get value(): string {
		return this._value;
	}

	public toString(): string {
		return this._value;
	}

	public equals(other: PluginType): boolean {
		return this._value === other._value;
	}

	/**
	 * Checks if this is a DTS-type plugin.
	 */
	public isDts(): boolean {
		return this._value === 'dts';
	}

	/**
	 * Create a PluginType from a string value.
	 * @throws Error if the value is not "internal", "external", or "dts"
	 */
	public static fromString(value: string): PluginType {
		if (value !== 'internal' && value !== 'external' && value !== 'dts') {
			throw new Error(
				`Invalid plugin type: ${value}. Valid values are "internal", "external", or "dts".`,
			);
		}
		return new PluginType(value);
	}
}
