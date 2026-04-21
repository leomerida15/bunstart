import { AdoptProjectUseCase } from './use-cases/AdoptProjectUseCase';
import type { UserInterfacePort } from '../../init/domain/ports/UserInterface.port';
import { dirname, basename } from 'node:path';

export interface AdoptCommandOptions {
    skipBuild?: boolean;
    cwd?: string;
}

/**
 * Command for adopting an existing project into the monorepo.
 *
 * This command wraps AdoptProjectUseCase to provide a consistent
 * command interface compatible with CreateProjectUseCase.
 *
 * @class AdoptCommand
 */
export class AdoptCommand {
    constructor(
        private readonly adoptProjectUseCase: AdoptProjectUseCase,
        private readonly userInterface: UserInterfacePort
    ) { }

    async execute(options: AdoptCommandOptions): Promise<void> {
        const cwd = options.cwd || process.cwd();

        // We need to determine `type` (app/pkg) and `name`.
        // Name is the basename of cwd.
        // Type defaults to 'app' for `bun create` templates usually.

        const name = basename(cwd) || 'unknown';
        const type = 'app'; // Default for create flow

        console.log(`Adopting ${name} as ${type}...`);

        // We need to find the Monorepo Root.
        // If we are in `cwd` (which is the new project dir), the root is parent.
        // But `AdoptProjectUseCase` needs `cwd` to be the root.

        const monorepoRoot = options.cwd ? dirname(options.cwd) : process.cwd();

        await this.adoptProjectUseCase.execute(
            monorepoRoot,
            type,
            name,
            options.cwd, // sourcePath
            { skipBuild: options.skipBuild }
        );
    }
}
