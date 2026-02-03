import { TemplateType } from '../value-objects/TemplateType';

/**
 * Template metadata configuration.
 *
 * @interface TemplateConfig
 */
export interface TemplateConfig {
	/** The template type */
	type: TemplateType;
	/** Display name for the template */
	name: string;
	/** Description of what the template provides */
	description: string;
	/** Color code (hex format) for UI display */
	color: string;
}

/**
 * Template entity representing a project template.
 *
 * This entity encapsulates all metadata about a project template,
 * including its type, display name, description, and visual styling.
 *
 * @class Template
 */
export class Template {
	/**
	 * The template type.
	 *
	 * @readonly
	 */
	public readonly type: TemplateType;

	/**
	 * The display name of the template.
	 *
	 * @readonly
	 */
	public readonly name: string;

	/**
	 * The description of what the template provides.
	 *
	 * @readonly
	 */
	public readonly description: string;

	/**
	 * The color code (hex format) for UI display.
	 *
	 * @readonly
	 */
	public readonly color: string;

	/**
	 * Creates a new Template instance.
	 *
	 * @param {TemplateConfig} config - The template configuration
	 */
	private constructor(config: TemplateConfig) {
		this.type = config.type;
		this.name = config.name;
		this.description = config.description;
		this.color = config.color;
	}

	/**
	 * Factory method to create a Template instance.
	 *
	 * @static
	 * @param {TemplateConfig} config - The template configuration
	 * @returns {Template} A new Template instance
	 */
	public static create(config: TemplateConfig): Template {
		return new Template(config);
	}

	/**
	 * Creates a Template from a template type string.
	 *
	 * @static
	 * @param {string} type - The template type string
	 * @param {string} name - The display name
	 * @param {string} description - The description
	 * @param {string} color - The color code
	 * @returns {Template} A new Template instance
	 */
	public static fromType(
		type: string,
		name: string,
		description: string,
		color: string
	): Template {
		return new Template({
			type: TemplateType.fromString(type),
			name,
			description,
			color
		});
	}

	/**
	 * Compares this Template with another for equality based on type.
	 *
	 * @param {Template} other - The other Template to compare
	 * @returns {boolean} True if both Templates have the same type
	 */
	public equals(other: Template): boolean {
		return this.type.equals(other.type);
	}
}
