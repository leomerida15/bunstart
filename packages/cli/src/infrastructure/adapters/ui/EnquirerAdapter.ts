import Enquirer from 'enquirer';
import { Template } from '../../../domain/entities/Template';
import type { SelectionResult, UserInterfacePort } from '@pkg/cli/src/domain/ports/UserInterface.port';

/**
 * Converts a hex color code to ANSI 256 color code.
 *
 * @param {string} hex - Hex color code (e.g., '#f472b6')
 * @returns {string} ANSI color escape code
 */
function hexToAnsi256(hex: string): string {
    // Remove # if present
    const cleanHex = hex.replace('#', '');

    // Parse RGB values
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    // Convert RGB to ANSI 256 color code
    // ANSI 256 color formula: 16 + 36*r + 6*g + b
    // Where r, g, b are in range 0-5
    const r256 = Math.round((r / 255) * 5);
    const g256 = Math.round((g / 255) * 5);
    const b256 = Math.round((b / 255) * 5);
    const ansi256 = 16 + 36 * r256 + 6 * g256 + b256;

    return `\x1b[38;5;${ansi256}m`;
}

/**
 * Resets ANSI color formatting.
 */
const RESET = '\x1b[0m';

/**
 * Formats a template name with its color.
 *
 * @param {Template} template - The template to format
 * @returns {string} Formatted template name with color
 */
function formatTemplateName(template: Template): string {
    const colorCode = hexToAnsi256(template.color);
    return `${colorCode}${template.name}${RESET}`;
}

/**
 * Enquirer adapter implementing the UserInterface port.
 *
 * This adapter provides user interaction capabilities using the enquirer library,
 * implementing the UserInterfacePort interface defined in the domain layer.
 *
 * @class EnquirerAdapter
 * @implements {UserInterfacePort}
 */
export class EnquirerAdapter implements UserInterfacePort {
    /**
     * Prompts the user to select a template from a list of available templates.
     *
     * @param {Template[]} templates - Array of available templates to choose from
     * @param {string} message - The prompt message to display
     * @returns {Promise<SelectionResult>} The selected template or cancellation status
     * @throws {Error} If the prompt operation fails
     */
    public async selectTemplate(
        templates: Template[],
        message: string
    ): Promise<SelectionResult> {
        try {
            const choices = templates.map(template => ({
                name: template.type.value,
                message: formatTemplateName(template),
                value: template.type.value,
                hint: template.description
            }));

            const response = await Enquirer.prompt<{ template: string }>({
                type: 'select',
                name: 'template',
                message,
                choices
            });

            const selectedTemplate = templates.find(
                t => t.type.value === response.template
            );

            if (!selectedTemplate) {
                return {
                    template: null,
                    cancelled: false
                };
            }

            return {
                template: selectedTemplate,
                cancelled: false
            };
        } catch (error) {
            // Handle cancellation (Ctrl+C)
            if (error && typeof error === 'object' && 'name' in error) {
                const err = error as { name?: string };
                if (err.name === 'Error' || err.name === 'CancelledPromptError') {
                    return {
                        template: null,
                        cancelled: true
                    };
                }
            }

            // Re-throw unexpected errors
            throw new Error(`Failed to prompt for template selection: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
