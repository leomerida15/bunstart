import type { ProcessPort } from '../../domain/ports/Process.port';

/**
 * Use case for delegating to bun create command.
 *
 * @class DelegateToBunCreateUseCase
 */
export class DelegateToBunCreateUseCase {
    /**
     * Creates an instance of DelegateToBunCreateUseCase.
     *
     * @param {ProcessPort} process - Process execution port
     */
    constructor(private readonly process: ProcessPort) { }

    /**
     * Executes bun create with the given template.
     *
     * @param {string} template - Bun create template name
     * @param {string} cwd - Working directory
     * @returns {Promise<{ success: boolean; error?: string }>}
     */
    async execute(
        template: string,
        cwd: string
    ): Promise<{ success: boolean; error?: string }> {
        const result = await this.process.exec(`bun create ${template}`, cwd);

        if (result.exitCode !== 0) {
            return {
                success: false,
                error: `bun create failed: ${result.stderr}`
            };
        }

        return { success: true };
    }
}
