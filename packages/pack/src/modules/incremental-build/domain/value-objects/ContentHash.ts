/**
 * Value object representing a SHA-256 content hash.
 * Validates that the hash is a 64-character hex string.
 */
export class ContentHash {
	private constructor(private readonly _value: string) {}

	public get value(): string {
		return this._value;
	}

	public toString(): string {
		return this._value;
	}

	public equals(other: ContentHash): boolean {
		return this._value === other._value;
	}

	/**
	 * Creates a ContentHash from a string, validating SHA-256 format.
	 * @throws Error if the value is not a valid 64-character hex string
	 */
	public static fromString(value: string): ContentHash {
		if (!ContentHash.isValidSha256(value)) {
			throw new Error(
				`Invalid SHA-256 hash: ${value}. Expected 64-character hex string.`,
			);
		}
		return new ContentHash(value);
	}

	/**
	 * Creates a ContentHash without validation (internal use only).
	 */
	public static unsafeFromString(value: string): ContentHash {
		return new ContentHash(value);
	}

	private static isValidSha256(value: string): boolean {
		return /^[a-f0-9]{64}$/i.test(value);
	}
}