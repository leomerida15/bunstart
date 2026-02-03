import { Template } from '../entities/Template';

/**
 * Template definitions repository.
 * 
 * This service provides access to all available template definitions
 * with their metadata including names, descriptions, and colors.
 * 
 * @class TemplateDefinitions
 */
export class TemplateDefinitions {
    /**
     * Gets all available templates.
     * 
     * @static
     * @returns {Template[]} Array of all available templates
     */
    public static getAllTemplates(): Template[] {
        return [
            Template.fromType(
                'monorepo',
                'Mono Repo',
                'Multi-package workspace with apps and packages structure',
                '#f472b6'
            ),
            Template.fromType(
                'api-rest',
                'API REST',
                'RESTful API server with Bun runtime',
                '#67bb4b'
            ),
            Template.fromType(
                'frontend-react',
                'Frontend React',
                'React application with Vite and Bun',
                '#58c4dc'
            ),
            Template.fromType(
                'library',
                'Library',
                'Reusable TypeScript library package',
                '#fbbf24'
            )
        ];
    }

    /**
     * Gets a template by its type string.
     * 
     * @static
     * @param {string} type - The template type string
     * @returns {Template | undefined} The template if found, undefined otherwise
     */
    public static getTemplateByType(type: string): Template | undefined {
        return TemplateDefinitions.getAllTemplates().find(
            template => template.type.value === type
        );
    }
}
