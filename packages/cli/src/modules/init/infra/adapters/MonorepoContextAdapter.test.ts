import { describe, it, expect, mock } from 'bun:test';
import { MonorepoContextAdapter } from './MonorepoContextAdapter';
import type { FilesystemPort } from '../../domain/ports/Filesystem.port';

type MockableExistsFile = ((path: string) => Promise<boolean>) & {
    mockImplementation(fn: (path: string) => Promise<boolean>): void;
};

describe('MonorepoContextAdapter', () => {
    const mockFilesystem: FilesystemPort & { existsFile: MockableExistsFile } = {
        existsFile: mock(() => Promise.resolve(false)) as MockableExistsFile,
        ensureDir: mock(() => Promise.resolve()),
        writeFile: mock(() => Promise.resolve()),
        deleteFile: mock(() => Promise.resolve()),
        existsDir: mock(() => Promise.resolve(false)),
        copyDirectory: mock(() => Promise.resolve())
    };

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
