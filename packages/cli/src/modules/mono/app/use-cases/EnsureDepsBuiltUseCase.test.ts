import { describe, test, expect, mock, beforeEach } from "bun:test";
import { EnsureDepsBuiltUseCase } from "./EnsureDepsBuiltUseCase";
import type { ResolveWorkspacesPort } from "../../domain/ports/ResolveWorkspaces.port";
import type { BuildWorkspacePort } from "../../domain/ports/BuildWorkspace.port";

// Mock data
const mockWorkspacePack = { id: 'pack', dir: 'packages', name: '@bunstart/pack', dependsOn: [] };
const mockWorkspaceCli = { id: 'cli', dir: 'packages', name: '@bunstart/cli', dependsOn: ['pack'] };

describe('EnsureDepsBuiltUseCase - Task 3.4 (Integration)', () => {

    let mockBuildWorkspace: BuildWorkspacePort;
    let mockCheckRebuild: any;
    let mockUpdateCache: any;
    let mockResolveWorkspaces: ResolveWorkspacesPort;

    beforeEach(() => {
        // Reset mocks before each test
        mockBuildWorkspace = {
            build: mock(() => Promise.resolve())
        } as unknown as BuildWorkspacePort;

        mockCheckRebuild = {
            execute: mock((name: string, entrypoints: string[]) => {
                // Default: needs rebuild (to be overridden in tests)
                return Promise.resolve({ needsRebuild: true, changedFiles: ['src/index.ts'] });
            })
        };

        mockUpdateCache = {
            execute: mock(() => Promise.resolve())
        };

        mockResolveWorkspaces = {
            resolve: mock(() => Promise.resolve([mockWorkspacePack, mockWorkspaceCli]))
        } as unknown as ResolveWorkspacesPort;
    });

    test('SHALL skip build for @bunstart/pack if hash matches (cache hit)', async () => {
        // Setup: pack does NOT need rebuild, cli DOES
        mockCheckRebuild.execute = mock((pkgName: string) => {
            if (pkgName === '@bunstart/pack') {
                return Promise.resolve({ needsRebuild: false, changedFiles: [] });
            }
            return Promise.resolve({ needsRebuild: true, changedFiles: ['src/index.ts'] });
        });

        const useCase = new EnsureDepsBuiltUseCase({
            resolveWorkspaces: mockResolveWorkspaces,
            buildWorkspace: mockBuildWorkspace,
            checkIfRebuildNeeded: mockCheckRebuild,
            updateCache: mockUpdateCache
        });

        await useCase.execute('/fake/cwd', 'cli');

        // 1. Check that build was called for 'cli' (dependsOn)
        // We expect build to be called with 'packages/cli' dir
        const buildCalls = (mockBuildWorkspace.build as any).mock.calls;
        const calledDirs = buildCalls.map((call: any[]) => call[1]); // second arg is workspaceDir

        // Should NOT build 'packages/pack' because needsRebuild was false
        expect(calledDirs).not.toContain('packages/pack');
        
        // Should BUILD 'packages/cli' because needsRebuild was true for it
        expect(calledDirs).toContain('packages/cli');
        expect(calledDirs.length).toBe(1); // Only cli was built
    });

    test('SHALL build both if both need rebuild', async () => {
        // Both need rebuild
        mockCheckRebuild.execute = mock(() => 
            Promise.resolve({ needsRebuild: true, changedFiles: ['src/index.ts'] })
        );

        const useCase = new EnsureDepsBuiltUseCase({
            resolveWorkspaces: mockResolveWorkspaces,
            buildWorkspace: mockBuildWorkspace,
            checkIfRebuildNeeded: mockCheckRebuild,
            updateCache: mockUpdateCache
        });

        await useCase.execute('/fake/cwd', 'cli');

        // Both should be built
        const buildCalls = (mockBuildWorkspace.build as any).mock.calls;
        const calledDirs = buildCalls.map((call: any[]) => call[1]);

        expect(calledDirs).toContain('packages/pack');
        expect(calledDirs).toContain('packages/cli');
        expect(calledDirs.length).toBe(2);
    });

    test('SHALL update cache only for packages that were built', async () => {
        // pack: no rebuild, cli: rebuild
        mockCheckRebuild.execute = mock((pkgName: string) => {
            if (pkgName === '@bunstart/pack') {
                return Promise.resolve({ needsRebuild: false, changedFiles: [] });
            }
            return Promise.resolve({ needsRebuild: true, changedFiles: ['src/index.ts'] });
        });

        const useCase = new EnsureDepsBuiltUseCase({
            resolveWorkspaces: mockResolveWorkspaces,
            buildWorkspace: mockBuildWorkspace,
            checkIfRebuildNeeded: mockCheckRebuild,
            updateCache: mockUpdateCache
        });

        await useCase.execute('/fake/cwd', 'cli');

        // updateCache should only be called for 'cli' (which was built)
        const cacheCalls = (mockUpdateCache.execute as any).mock.calls;
        expect(cacheCalls.length).toBe(1); // Only cli
        // The argument should be the package name
        expect(cacheCalls[0][0]).toBe('@bunstart/cli');
    });
});
