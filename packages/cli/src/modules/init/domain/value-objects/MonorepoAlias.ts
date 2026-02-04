/**
 * Value object representing a validated monorepo alias/scope name.
 *
 * Used for workspace package names like @alias/pkg-example.
 * Validates npm-like scope: lowercase alphanumeric, hyphens, underscores.
 *
 * @class MonorepoAlias
 */
export class MonorepoAlias {
	private static readonly MIN_LENGTH = 1;
	private static readonly MAX_LENGTH = 50;
	private static readonly VALID_PATTERN = /^[a-z0-9][a-z0-9._-]*$/;

	private readonly _value: string;

	private constructor(value: string) {
		this._value = value;
	}

	/**
	 * Creates a MonorepoAlias from a string, stripping leading @ if present.
	 *
	 * @param {string} value - Raw alias (e.g. "myorg" or "@myorg")
	 * @returns {MonorepoAlias}
	 * @throws {Error} If value is invalid
	 */
	public static fromString(value: string): MonorepoAlias {
		const stripped = value.startsWith('@') ? value.slice(1) : value.trim();

		if (stripped.length < MonorepoAlias.MIN_LENGTH) {
			throw new Error('Monorepo alias cannot be empty.');
		}
		if (stripped.length > MonorepoAlias.MAX_LENGTH) {
			throw new Error(
				`Monorepo alias must be at most ${MonorepoAlias.MAX_LENGTH} characters.`
			);
		}
		if (!MonorepoAlias.VALID_PATTERN.test(stripped)) {
			throw new Error(
				'Monorepo alias must start with a letter or number and contain only lowercase letters, numbers, hyphens, underscores, or dots.'
			);
		}

		return new MonorepoAlias(stripped);
	}

	public get value(): string {
		return this._value;
	}

	/**
	 * Returns the scoped format (e.g. "@myorg").
	 */
	public toScoped(): string {
		return `@${this._value}`;
	}
}
