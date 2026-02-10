import { describe, it, expect, mock } from 'bun:test';
import { MonorepoContextAdapter } from './MonorepoContextAdapter';
import type { FilesystemPort } from '../../domain/ports/Filesystem.port';

describe('MonorepoContextAdapter', () => {
    const mockFilesystem = {
        existsFile: mock<() => Promise<boolean>>(),
        readFile: mock<() => Promise<string>>(),
        writeFile: mock<() => Promise<void>>(),
        createDirectory: mock<() => Promise<void>>(),
        existsDirectory: mock<() => Promise<boolean>>(),
        copy: mock<() => Promise<void>>(),
        getTemplatePath: mock<() => string>()
    } as unknown as FilesystemPort;

    const adapter = new MonorepoContextAdapter(mockFilesystem);

    it('should return isMonorepo: true when bunstart.config.ts exists in cwd', async () => {
        mockFilesystem.existsFile.mockImplementation(async (path: string) => {
            return path === '/app/bunstart.config.ts';
        });

        const result = await adapter.detectContext('/app');

        expect(result).toEqual({
            isMonorepo: true,
            monorepoRoot: '/app'
        });
    });

    it('should return isMonorepo: true when bunstart.config.ts exists in parent directory', async () => {
        mockFilesystem.existsFile.mockImplementation(async (path: string) => {
            return path === '/app/bunstart.config.ts';
        });

        const result = await adapter.detectContext('/app/child');

        expect(result).toEqual({
            isMonorepo: true,
            monorepoRoot: '/app'
        });
    });

    it('should return isMonorepo: false when bunstart.config.ts is not found', async () => {
        mockFilesystem.existsFile.mockImplementation(async () => false);

        const result = await adapter.detectContext('/app');

        expect(result).toEqual({
            isMonorepo: false,
            monorepoRoot: null
        });
    });
});
