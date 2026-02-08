import { join } from 'node:path';
import type { InitCommand } from '../../../init/app/InitCommand';
import type { FilesystemPort } from '../../../init/domain/ports/Filesystem.port';
import type { UserInterfacePort } from '../../../init/domain/ports/UserInterface.port';

export interface CreateMonoRepoUseCaseProps {
    initCommand: InitCommand;
    filesystem: FilesystemPort;
    userInterface: UserInterfacePort;
}

export class CreateMonoRepoUseCase {
    private readonly initCommand: InitCommand;
    private readonly filesystem: FilesystemPort;
    private readonly userInterface: UserInterfacePort;

    constructor({
        initCommand,
        filesystem,
        userInterface
    }: CreateMonoRepoUseCaseProps) {
        this.initCommand = initCommand;
        this.filesystem = filesystem;
        this.userInterface = userInterface;
    }

    async execute(name?: string): Promise<void> {
        let targetName = name;
        const cwd = process.cwd();

        if (!targetName) {
            const res = await this.userInterface.promptProjectName('Project directory name:');
            if (!res) {
                console.log('Operation cancelled.');
                return;
            }
            targetName = res;
        }

        console.log(`Creating project directory: ${targetName}`);
        const targetDir = join(cwd, targetName);

        // If directory doesn't exist, create it.
        // If it exists, init command generally handles it (errors if not empty, or warns).
        try {
            await this.filesystem.ensureDir(targetDir);
        } catch (error) {
            console.error(`Failed to create directory: ${String(error)}`);
            return;
        }

        // Execute init command inside the new directory
        await this.initCommand.execute(targetDir);
    }
}
