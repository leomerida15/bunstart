/**
 * Short asset hash for cache-busting (8 characters from SHA-256).
 */
export class AssetHash {
	private constructor(private readonly _value: string) {}

	public get value(): string {
		return this._value;
	}

	public toString(): string {
		return this._value;
	}

	/**
	 * Creates an AssetHash from a full SHA-256 hash.
	 * Takes the first 8 characters.
	 */
	public static fromSha256(fullHash: string): AssetHash {
		return new AssetHash(fullHash.substring(0, 8));
	}

	/**
	 * Validates that a hash is exactly 8 characters of hex.
	 */
	public static isValid(value: string): boolean {
		return /^[a-f0-9]{8}$/i.test(value);
	}
}