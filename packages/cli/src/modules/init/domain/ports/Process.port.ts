/**
 * Result of executing a shell command.
 *
 * @interface ProcessResult
 */
export interface ProcessResult {
    /** Exit code of the command */
    exitCode: number;
    /** Standard output */
    stdout: string;
    /** Standard error */
    stderr: string;
}

/**
 * Port interface for executing shell commands.
 *
 * This port defines the contract for executing shell commands,
 * allowing the application layer to run external processes without
 * depending on specific implementation details.
 *
 * Following the Dependency Inversion Principle, this interface
 * is defined in the domain layer, and implementations are provided
 * by the infrastructure layer.
 *
 * @interface ProcessPort
 */
export interface ProcessPort {
    /**
     * Executes a shell command.
     *
     * @param {string} command - The command to execute
     * @param {string} cwd - Working directory for execution
     * @returns {Promise<ProcessResult>}
     */
    exec(command: string, cwd: string): Promise<ProcessResult>;
}
