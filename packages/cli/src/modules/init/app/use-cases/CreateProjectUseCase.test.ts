import { describe, it, expect, mock, spyOn } from 'bun:test';
import { CreateProjectUseCase } from './CreateProjectUseCase';
import type { MonorepoContextResult } from '../../domain/ports/MonorepoContext.port';

describe('CreateProjectUseCase', () => {
    const mockMonorepoContext = {
        detectContext: mock()
    };
    const mockUi = {
        promptProjectName: mock(),
        confirmGenerateBuildScripts: mock()
    };
    const mockFilesystem = {
        ensureDir: mock(),
        existsDir: mock(),
        existsFile: mock(),
        writeFile: mock()
    };
    const mockInitCommand = {
        execute: mock()
    };
    const mockAdoptCommand = {
        execute: mock()
    };
    const mockDelegateToBunCreate = {
        execute: mock()
    };

    const useCase = new CreateProjectUseCase(
        mockMonorepoContext as any,
        mockUi as any,
        mockFilesystem as any,
        mockInitCommand as any,
        mockAdoptCommand as any,
        mockDelegateToBunCreate as any
    );

    it('should create a project in standalone mode', async () => {
        mockMonorepoContext.detectContext.mockResolvedValue({
            isMonorepo: false,
            monorepoRoot: undefined
        });
        mockUi.promptProjectName.mockResolvedValue('my-app');
        mockUi.confirmGenerateBuildScripts.mockResolvedValue({ shouldGenerate: true });
        mockInitCommand.execute.mockResolvedValue({ completed: true });
        mockFilesystem.ensureDir.mockResolvedValue(undefined);
        mockFilesystem.existsFile.mockResolvedValue(false);
        mockFilesystem.writeFile.mockResolvedValue(undefined);

        const result = await useCase.execute({});

        expect(result.success).toBe(true);
        expect(result.projectPath).toContain('my-app');
        expect(mockInitCommand.execute).toHaveBeenCalledWith({
            name: 'my-app',
            cwd: expect.stringContaining('my-app')
        });
        expect(mockFilesystem.writeFile).toHaveBeenCalled();
        expect(mockAdoptCommand.execute).not.toHaveBeenCalled();
        expect(mockFilesystem.ensureDir).toHaveBeenCalled();
    });

    it('should create and adopt a project in monorepo mode', async () => {
        mockMonorepoContext.detectContext.mockResolvedValue({
            isMonorepo: true,
            monorepoRoot: '/root'
        });
        mockUi.promptProjectName.mockResolvedValue('my-pkg');
        mockInitCommand.execute.mockResolvedValue({ completed: true });
        mockAdoptCommand.execute.mockResolvedValue(undefined);
        mockFilesystem.ensureDir.mockResolvedValue(undefined);
        mockFilesystem.existsFile.mockResolvedValue(false);
        mockFilesystem.writeFile.mockResolvedValue(undefined);
        mockUi.confirmGenerateBuildScripts.mockResolvedValue({ shouldGenerate: true });

        const result = await useCase.execute({});

        expect(result.success).toBe(true);
        expect(result.projectPath).toBe('/root/apps/my-pkg');
        expect(mockInitCommand.execute).toHaveBeenCalledWith({
            name: 'my-pkg',
            cwd: '/root/my-pkg'
        });
        expect(mockAdoptCommand.execute).toHaveBeenCalled();
    });

    it('should return cancelled when init is cancelled', async () => {
        mockMonorepoContext.detectContext.mockResolvedValue({
            isMonorepo: false,
            monorepoRoot: undefined
        });
        mockUi.promptProjectName.mockResolvedValue('my-app');
        mockUi.confirmGenerateBuildScripts.mockResolvedValue({ shouldGenerate: true });
        mockInitCommand.execute.mockResolvedValue({ completed: false });
        mockFilesystem.ensureDir.mockResolvedValue(undefined);

        const result = await useCase.execute({});

        expect(result.success).toBe(false);
        expect(result.error).toBe('Cancelled');
        expect(mockAdoptCommand.execute).not.toHaveBeenCalled();
        expect(mockFilesystem.writeFile).not.toHaveBeenCalled();
    });

    it('should delegate to bun create if appTemplate provided', async () => {
        mockMonorepoContext.detectContext.mockResolvedValue({
            isMonorepo: false
        });
        mockDelegateToBunCreate.execute.mockResolvedValue({ success: true });
        mockFilesystem.ensureDir.mockResolvedValue(undefined);

        const result = await useCase.execute({
            projectName: 'my-app',
            appTemplate: 'react'
        });

        expect(result.success).toBe(true);
        expect(mockDelegateToBunCreate.execute).toHaveBeenCalled();
        expect(mockInitCommand.execute).not.toHaveBeenCalled();
    });
});
