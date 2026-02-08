import { join } from 'node:path';
import type { ResolveWorkspacesPort } from '../../domain/ports/ResolveWorkspaces.port';
import type { AdoptProjectUseCase } from './AdoptProjectUseCase';
import type { UserInterfacePort } from '../../../init/domain/ports/UserInterface.port';
import type { PackageJsonPort } from '../../../init/domain/ports/PackageJson.port';
import type { InitializeConfigUseCase } from '../../../config-state/app/use-cases/InitializeConfigUseCase';
import type { BunstartConfig } from '../../../config-state/domain/entities/BunstartConfig';

export interface MigrateMonoRepoUseCaseProps {
    resolveWorkspaces: ResolveWorkspacesPort;
    adoptProject: AdoptProjectUseCase;
    userInterface: UserInterfacePort;
    packageJson: PackageJsonPort;
    initializeConfig: InitializeConfigUseCase;
}

export class MigrateMonoRepoUseCase {
    private readonly resolveWorkspaces: ResolveWorkspacesPort;
    private readonly adoptProject: AdoptProjectUseCase;
    private readonly userInterface: UserInterfacePort;
    private readonly packageJson: PackageJsonPort;
    private readonly initializeConfig: InitializeConfigUseCase;

    constructor({
        resolveWorkspaces,
        adoptProject,
        userInterface,
        packageJson,
        initializeConfig
    }: MigrateMonoRepoUseCaseProps) {
        this.resolveWorkspaces = resolveWorkspaces;
        this.adoptProject = adoptProject;
        this.userInterface = userInterface;
        this.packageJson = packageJson;
        this.initializeConfig = initializeConfig;
    }

    async execute(cwd: string): Promise<void> {
        console.log('\n🔄 Migrating monorepo...');
        try {
            // 1. Check root package.json name
            let rootPkg: Record<string, unknown> = {};
            try {
                rootPkg = await this.packageJson.read(join(cwd, 'package.json'));
            } catch {
                console.error('No package.json found in current directory.');
                return;
            }

            const currentName = typeof rootPkg.name === 'string' ? rootPkg.name : '';
            const helperMsg = currentName ? `Current: ${currentName}` : 'No name set';

            const newNameInput = await this.userInterface.askAlias(
                `Monorepo name (must start with @, e.g. @org). ${helperMsg}. Press Enter to keep or type new:`,
                currentName
            );

            if (newNameInput === null) {
                console.log('Migration cancelled.');
                return;
            }

            let finalName = newNameInput.trim();
            if (!finalName.startsWith('@')) {
                finalName = `@${finalName}`;
            }

            if (finalName !== currentName) {
                await this.packageJson.patch(cwd, { name: finalName });
                console.log(`Updated package.json name to ${finalName}`);
            }

            // 2. Create bunstart.config.ts
            const bunstartConfig: BunstartConfig = {
                repo: { apps: {}, packages: {} }
            };
            // Check if config already exists? The use case overwrites.
            // Ideally we shouldn't overwrite if it exists, but "migrate" implies adopting structure.
            // Requirement says "crear el bunstart.config.ts".
            // Use generic InitializeConfigUseCase which overwrites.
            await this.initializeConfig.execute(cwd, bunstartConfig);
            console.log('Created bunstart.config.ts');

            // 3. Resolve workspaces and adopt them
            // PackageJsonWorkspacesAdapter will read workspaces from package.json
            const workspaces = await this.resolveWorkspaces.resolve(cwd);

            if (workspaces.length === 0) {
                console.log('No workspaces found in package.json.');
            }

            for (const ws of workspaces) {
                let type: 'app' | 'pkg' | null = null;
                // Detect type primarily by directory conventions
                if (ws.dir === 'apps' || ws.dir.endsWith('/apps')) {
                    type = 'app';
                } else if (ws.dir === 'packages' || ws.dir.endsWith('/packages')) {
                    type = 'pkg';
                } else {
                    console.warn(
                        `Skipping workspace "${ws.id}" in "${ws.dir}": unknown type (not in apps or packages)`
                    );
                    continue;
                }

                console.log(`Adopting ${type} "${ws.id}"...`);
                try {
                    await this.adoptProject.execute(cwd, type, ws.id);
                } catch (e) {
                    console.error(`Failed to adopt ${ws.id}: ${e instanceof Error ? e.message : String(e)}`);
                }
            }

            console.log('\n✅ Migration complete.');
        } catch (e: unknown) {
            console.error(`Migration failed: ${e instanceof Error ? e.message : String(e)}`);
        }
    }
}
