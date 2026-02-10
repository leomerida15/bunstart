/**
 * Options for the create command.
 *
 * @interface CreateCommandOptions
 */
export interface CreateCommandOptions {
    /** Project name (optional, will prompt if not provided) */
    projectName?: string;
    /** App template to use with bun create (optional) */
    appTemplate?: string;
    /** Whether to skip prompting (batch mode) */
    skipPrompts?: boolean;
    /** Whether to generate build/watch scripts (undefined = ask user) */
    generateBuildScripts?: boolean;
    /** Working directory */
    cwd?: string;
}
