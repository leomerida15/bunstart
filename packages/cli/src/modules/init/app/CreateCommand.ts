import type { CreateCommandOptions } from '../domain/entities/CreateCommandOptions';
import { CreateProjectUseCase } from './use-cases/CreateProjectUseCase';

/**
 * CLI Command for creating new projects.
 *
 * This command provides:
 * - Wrapper for init with folder creation
 * - Wrapper for bun create with optional app template
 * - Automatic adoption in monorepo contexts
 *
 * @class CreateCommand
 */
export class CreateCommand {
    /**
     * Creates an instance of CreateCommand.
     *
     * @param {CreateProjectUseCase} createProjectUseCase - Use case for project creation
     */
    constructor(
        private readonly createProjectUseCase: CreateProjectUseCase
    ) { }

    /**
     * Executes the create command.
     *
     * @param {string[]} args - Command arguments
     * @param {string} cwd - Current working directory
     * @returns {Promise<void>}
     */
    async execute(args: string[], cwd: string): Promise<void> {
        // Parse arguments
        const options = this.parseArgs(args, cwd);

        // Execute create flow
        const result = await this.createProjectUseCase.execute(options);

        if (result.success) {
            console.log(`✅ Proyecto creado en: ${result.projectPath}`);
        } else {
            console.error(`❌ Error: ${result.error}`);
            process.exit(1);
        }
    }

    /**
     * Parses command arguments into options.
     *
     * @param {string[]} args - Command arguments
     * @param {string} cwd - Current working directory
     * @returns {CreateCommandOptions}
     */
    private parseArgs(args: string[], cwd: string): CreateCommandOptions {
        const options: CreateCommandOptions = {
            cwd,
        };

        // First positional argument is app template or potential project name if we want?
        // Sprint 4 doc says "First positional argument is app template"
        // e.g. bunstart create next-app
        // If not provided, it's interactive or blank?

        // Check if first arg is an option
        const firstArg = args[0];
        if (firstArg && !firstArg.startsWith('-')) {
            // Is it a template? Or project name?
            // "bunstart create my-app" -> template=my-app?
            // Or "bunstart create" -> prompt name + prompt template?

            // Doc says: "bunstart create next-app # Create Next.js app"
            // This implies the arg IS the template.
            // What about project name?
            // CreateProjectUseCase prompts for name if not in options.
            // Can we pass project name via CLI?
            // CLI usage usually: create <template> <destination> OR create <destination> --template <template>

            // Let's follow the doc: args[0] is appTemplate.
            // But if I want to just create a blank app named 'foo'?
            // `bunstart create` -> interactive.

            // If I run `bunstart create foo`, is 'foo' the template?
            // `bun create foo` would try to use template 'foo'.

            // If I want to use internal init, I run `bunstart create`.

            // Maybe we should allow `bunstart create [name] --template [template]`?
            // Doc example: `bunstart create next-app`.
            // This delegates to `bun create next-app`.

            // What if I want `bunstart create my-app` (using default blank template)?
            // Current logic in doc treats first arg as template.

            // We will stick to the doc implementation for now.
            options.appTemplate = firstArg;
        }

        // Parse flags
        if (args.includes('--skip-build')) {
            options.generateBuildScripts = false;
        }

        if (args.includes('--yes') || args.includes('-y')) {
            options.skipPrompts = true;
            if (options.generateBuildScripts === undefined) {
                options.generateBuildScripts = true; // Default to yes
            }
        }

        return options;
    }

    /**
     * Returns command help text.
     *
     * @returns {string}
     */
    static getHelp(): string {
        return `
Usage: bunstart create [app] [options]

Create a new project with bunstart conventions.

Arguments:
  app                 Bun create template (e.g., next-app, react)

Options:
  --skip-build        Skip generating bunstart.build.ts and bunstart.watch.ts
  --yes, -y           Skip prompts, use defaults
  --help              Show this help

Examples:
  bunstart create                      # Interactive mode
  bunstart create next-app             # Create Next.js app
  bunstart create next-app --skip-build # Create without bunstart scripts
`;
    }
}
