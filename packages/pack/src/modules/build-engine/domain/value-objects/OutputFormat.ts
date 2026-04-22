/**
 * Output format for the bundled output.
 */
export class OutputFormat {
	private constructor(private readonly _value: 'esm' | 'cjs' | 'iife') {}

	public get value(): string {
		return this._value;
	}

	public toString(): string {
		return this._value;
	}

	public equals(other: OutputFormat): boolean {
		return this._value === other._value;
	}

	public static fromString(value: string): OutputFormat {
		if (value !== 'esm' && value !== 'cjs' && value !== 'iife') {
			throw new Error(
				`Invalid output format: ${value}. Valid values are "esm", "cjs", or "iife".`,
			);
		}
		return new OutputFormat(value);
	}
}
