import type {
    ProcessPort,
    ProcessResult
} from '../../domain/ports/Process.port';

/**
 * Adapter for executing shell processes.
 *
 * This adapter implements ProcessPort using Bun's native
 * process execution capabilities.
 *
 * @class ProcessAdapter
 */
export class ProcessAdapter implements ProcessPort {
    async exec(command: string, cwd: string): Promise<ProcessResult> {
        const process = Bun.spawn(command.split(' '), {
            cwd,
            stdout: 'pipe',
            stderr: 'pipe'
        });

        const stdout = await new Response(process.stdout).text();
        const stderr = await new Response(process.stderr).text();
        const exitCode = await process.exitCode;

        return {
            exitCode: exitCode ?? -1,
            stdout,
            stderr
        };
    }
}
