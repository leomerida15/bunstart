/**
 * Value object representing a template type identifier.
 *
 * This value object ensures type safety and validation for template types
 * used throughout the application. It encapsulates the template type string
 * and provides validation to ensure only valid template types are used.
 *
 * @class TemplateType
 */
export class TemplateType {
	/**
	 * Valid template type values.
	 *
	 * @readonly
	 * @static
	 */
	public static readonly VALID_TYPES = [
		'monorepo',
		'api-rest',
		'frontend-react',
		'library'
	] as const;

	/**
	 * The template type value.
	 *
	 * @private
	 * @readonly
	 */
	private readonly _value: string;

	/**
	 * Creates a new TemplateType instance.
	 *
	 * @param {string} value - The template type string value
	 * @throws {Error} If the value is not a valid template type
	 */
	constructor(value: string) {
		if (!TemplateType.isValid(value)) {
			throw new Error(
				`Invalid template type: ${value}. Valid types are: ${TemplateType.VALID_TYPES.join(', ')}`
			);
		}
		this._value = value;
	}

	/**
	 * Gets the template type value.
	 *
	 * @returns {string} The template type string value
	 */
	public get value(): string {
		return this._value;
	}

	/**
	 * Validates if a string is a valid template type.
	 *
	 * @static
	 * @param {string} value - The value to validate
	 * @returns {boolean} True if the value is valid, false otherwise
	 */
	public static isValid(value: string): boolean {
		return TemplateType.VALID_TYPES.includes(
			value as (typeof TemplateType.VALID_TYPES)[number]
		);
	}

	/**
	 * Creates a TemplateType from a string value.
	 *
	 * @static
	 * @param {string} value - The template type string value
	 * @returns {TemplateType} A new TemplateType instance
	 * @throws {Error} If the value is not a valid template type
	 */
	public static fromString(value: string): TemplateType {
		return new TemplateType(value);
	}

	/**
	 * Compares this TemplateType with another for equality.
	 *
	 * @param {TemplateType} other - The other TemplateType to compare
	 * @returns {boolean} True if both TemplateTypes have the same value
	 */
	public equals(other: TemplateType): boolean {
		return this._value === other._value;
	}

	/**
	 * Returns the string representation of the template type.
	 *
	 * @returns {string} The template type value
	 */
	public toString(): string {
		return this._value;
	}
}
