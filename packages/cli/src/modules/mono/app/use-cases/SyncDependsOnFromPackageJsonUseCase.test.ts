import { describe, test, expect, mock } from "bun:test";
import { SyncDependsOnFromPackageJsonUseCase } from "./SyncDependsOnFromPackageJsonUseCase";
import type { ResolveWorkspacesPort } from "../../domain/ports/ResolveWorkspaces.port";
import type { LoadConfigUseCase } from "../../../config-state/app/use-cases/LoadConfigUseCase";
import type { PatchConfigUseCase } from "../../../config-state/app/use-cases/PatchConfigUseCase";
import type { PackageJsonPort } from "../../../init/domain/ports/PackageJson.port";

// Mock data
const mockWorkspaceCli = {
    id: 'cli',
    dir: 'packages',
    name: '@bunstart/cli',
    dependsOn: []
};

const mockWorkspacePack = {
    id: 'pack',
    dir: 'packages',
    name: '@bunstart/pack',
    dependsOn: []
};

const createMocks = (pkgJsonContent: any) => {
    const mockResolveWorkspaces = {
        resolve: mock(() => Promise.resolve([mockWorkspaceCli, mockWorkspacePack]))
    } as unknown as ResolveWorkspacesPort;

    const mockLoadConfig = {
        execute: mock(() => Promise.resolve({ 
            repo: { 
                apps: {}, 
                packages: { 
                    cli: { name: '@bunstart/cli', dependsOn: [] },
                    pack: { name: '@bunstart/pack', dependsOn: [] }
                } 
            } 
        }))
    } as unknown as LoadConfigUseCase;

    const mockPatchConfig = {
        execute: mock(() => Promise.resolve())
    } as unknown as PatchConfigUseCase;

    const mockPackageJson = {
        read: mock((path: string) => Promise.resolve(pkgJsonContent))
    } as unknown as PackageJsonPort;

    return { mockResolveWorkspaces, mockLoadConfig, mockPatchConfig, mockPackageJson };
};

describe('SyncDependsOnFromPackageJsonUseCase - Task 3.1', () => {

    test('Should IGNORE devDependencies (RED phase - should fail with current code)', async () => {
        // This package is ONLY in devDependencies, not in dependencies
        const pkgJson = {
            name: '@bunstart/cli',
            dependencies: { '@bunstart/pack': 'workspace:*' },
            devDependencies: { '@bunstart/fake-tool': 'workspace:*' } // This is a workspace tool, should be ignored
        };

        const { mockResolveWorkspaces, mockLoadConfig, mockPatchConfig, mockPackageJson } = createMocks(pkgJson);

        // Add the fake workspace to the resolver mock
        (mockResolveWorkspaces.resolve as any).mockReturnValue(Promise.resolve([
            mockWorkspaceCli,
            mockWorkspacePack,
            { id: 'fake-tool', dir: 'packages', name: '@bunstart/fake-tool', dependsOn: [] }
        ]));

        const useCase = new SyncDependsOnFromPackageJsonUseCase({
            resolveWorkspaces: mockResolveWorkspaces,
            loadConfig: mockLoadConfig,
            patchConfig: mockPatchConfig,
            packageJson: mockPackageJson
        });

        await useCase.execute('/fake/cwd', 'cli');

        // Verify patchConfig was called
        expect(mockPatchConfig.execute).toHaveBeenCalled();

        const patchArg = (mockPatchConfig.execute as any).mock.calls[0][1];
        const dependsOn = patchArg.repo.packages['cli'].dependsOn;

        // THIS SHOULD FAIL IN RED PHASE because current code includes devDependencies
        // 'fake-tool' is in devDependencies, should NOT be in dependsOn after fix
        expect(dependsOn).not.toContain('fake-tool');
        
        // Only 'pack' from dependencies should be there
        expect(dependsOn).toContain('pack');
        expect(dependsOn.length).toBe(1);
    });

    test('Should sync ONLY runtime dependencies', async () => {
        const pkgJson = {
            name: '@bunstart/cli',
            dependencies: { '@bunstart/pack': 'workspace:*' },
            devDependencies: { 'typescript': '^5' } // Not a workspace, but even if it were
        };

        const { mockResolveWorkspaces, mockLoadConfig, mockPatchConfig, mockPackageJson } = createMocks(pkgJson);

        const useCase = new SyncDependsOnFromPackageJsonUseCase({
            resolveWorkspaces: mockResolveWorkspaces,
            loadConfig: mockLoadConfig,
            patchConfig: mockPatchConfig,
            packageJson: mockPackageJson
        });

        await useCase.execute('/fake/cwd', 'cli');

        const patchArg = (mockPatchConfig.execute as any).mock.calls[0][1];
        const dependsOn = patchArg.repo.packages['cli'].dependsOn;

        expect(dependsOn).toContain('pack');
        expect(dependsOn.length).toBe(1);
    });
});
