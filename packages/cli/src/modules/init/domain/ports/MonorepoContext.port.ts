/**
 * Result of checking if we're in a monorepo context.
 *
 * @interface MonorepoContextResult
 */
export interface MonorepoContextResult {
    /** Whether we're inside a monorepo */
    isMonorepo: boolean;
    /** Path to the monorepo root if inside, null otherwise */
    monorepoRoot: string | null;
}

/**
 * Port interface for detecting monorepo context.
 *
 * This port defines the contract for detecting whether the current
 * working directory is inside a bunstart monorepo.
 *
 * Following the Dependency Inversion Principle, this interface
 * is defined in the domain layer, and implementations are provided
 * by the infrastructure layer.
 *
 * @interface MonorepoContextPort
 */
export interface MonorepoContextPort {
    /**
     * Checks if the current directory is inside a monorepo.
     * Searches for bunstart.config.ts in current or ancestor directories.
     *
     * @param {string} cwd - Current working directory
     * @returns {Promise<MonorepoContextResult>}
     */
    detectContext(cwd: string): Promise<MonorepoContextResult>;
}
