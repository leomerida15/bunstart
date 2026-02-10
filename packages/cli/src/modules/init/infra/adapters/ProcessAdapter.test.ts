import { describe, it, expect } from 'bun:test';
import { ProcessAdapter } from './ProcessAdapter';

describe('ProcessAdapter', () => {
    const adapter = new ProcessAdapter();

    it('should execute a command successfully and return stdout', async () => {
        const result = await adapter.exec('echo "Hello World"', '.');

        expect(result.exitCode).toBe(0);
        expect(result.stdout.trim()).toBe('"Hello World"');
        expect(result.stderr).toBe('');
    });

    it('should return stderr when command fails', async () => {
        // Attempting to list a non-existent file
        const result = await adapter.exec('ls non_existent_file', '.');

        expect(result.exitCode).not.toBe(0);
        expect(result.stderr).toContain('No such file or directory');
    });

    it('should execute command in the specified cwd', async () => {
        const result = await adapter.exec('pwd', '/tmp');

        expect(result.exitCode).toBe(0);
        expect(result.stdout.trim()).toBe('/tmp');
    });
});
