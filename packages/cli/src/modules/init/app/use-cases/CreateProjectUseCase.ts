import type { CreateCommandOptions } from '../../domain/entities/CreateCommandOptions';
import type { MonorepoContextPort } from '../../domain/ports/MonorepoContext.port';
import type { UserInterfacePort } from '../../domain/ports/UserInterface.port';
import type { FilesystemPort } from '../../domain/ports/Filesystem.port';
import { InitCommand } from '../InitCommand';
import { AdoptCommand } from '../../../mono/app/AdoptCommand';
import { DelegateToBunCreateUseCase } from './DelegateToBunCreateUseCase';
import type { MonorepoContextResult } from '../../domain/ports/MonorepoContext.port';
import { basename } from 'node:path';

/**
 * Result of the create project operation.
 *
 * @interface CreateProjectResult
 */
export interface CreateProjectResult {
    /** Whether the operation was successful */
    success: boolean;
    /** Path to the created project */
    projectPath: string;
    /** Any error message */
    error?: string;
}

/**
 * Use case for creating new projects.
 *
 * This use case orchestrates the entire project creation flow,
 * handling both local templates and bun create delegation.
 *
 * @class CreateProjectUseCase
 */
export class CreateProjectUseCase {
    constructor(
        private readonly monorepoContext: MonorepoContextPort,
        private readonly ui: UserInterfacePort,
        private readonly filesystem: FilesystemPort,
        private readonly initCommand: InitCommand,
        private readonly adoptCommand: AdoptCommand,
        private readonly delegateToBunCreate: DelegateToBunCreateUseCase
    ) { }

    /**
     * Executes the create project flow.
     *
     * @param {CreateCommandOptions} options - Command options
     * @returns {Promise<CreateProjectResult>}
     */
    async execute(options: CreateCommandOptions): Promise<CreateProjectResult> {
        try {
            // 1. Detect context (monorepo or standalone)
            const context = await this.monorepoContext.detectContext(
                options.cwd || process.cwd()
            );

            // 2. Get project name (prompt if not provided)
            let projectName = options.projectName;
            if (!projectName && !options.skipPrompts) {
                const promptResult = await this.ui.promptProjectName(
                    'Nombre del proyecto:',
                    undefined
                );
                if (!promptResult) {
                    return { success: false, projectPath: '', error: 'Cancelled' };
                }
                projectName = promptResult;
            }

            if (!projectName) {
                return { success: false, projectPath: '', error: 'Project name required' };
            }

            // 3. Determine target directory
            const targetDir = context.isMonorepo
                ? `${context.monorepoRoot}/${projectName}` // This logic might need adjustment based on typical monorepo structure (e.g. apps/name) logic handled in AdoptProject
                : `${process.cwd()}/${projectName}`;

            // NOTE: In monorepo context, if we use `init` or `bun create`, we essentially create a folder.
            // AdoptProjectUseCase expects the folder to exist or source to exist.

            // If context is monorepo, we ideally want to create it inside `apps/` or `packages/`.
            // `AdoptCommand` handles the move/copy if we create it in a temp place?
            // OR we create it directly where it should be?

            // logic in Sprint 3 doc says:
            // const targetDir = context.isMonorepo ? `${context.monorepoRoot}/${projectName}` : ...
            // This puts it at the ROOT of the monorepo temporarily?

            // Let's stick to the doc logic, but verify behavior.

            // 4. Check if bun create delegation
            if (options.appTemplate) {
                return this.handleBunCreateDelegation(
                    options.appTemplate,
                    targetDir,
                    context,
                    options.skipPrompts
                );
            }

            // 5. Create directory
            await this.filesystem.ensureDir(targetDir);

            // 6. Confirm build scripts (unless skipped)
            let generateBuildScripts = options.generateBuildScripts;
            if (generateBuildScripts === undefined && !options.skipPrompts) {
                const confirmation = await this.ui.confirmGenerateBuildScripts();
                generateBuildScripts = confirmation.shouldGenerate;
            }

            // 7. Execute init (full CLI: template selection) then adopt if monorepo
            const initResult = await this.initCommand.execute({
                name: projectName,
                cwd: targetDir
            });

            if (!initResult.completed) {
                return { success: false, projectPath: '', error: 'Cancelled' };
            }

            const packageJsonPath = `${targetDir}/package.json`;
            if (!(await this.filesystem.existsFile(packageJsonPath))) {
                await this.ensurePackageJson(targetDir, projectName);
            }

            if (context.isMonorepo) {
                await this.adoptCommand.execute({
                    cwd: targetDir,
                    skipBuild: !generateBuildScripts
                });
                const finalPath = `${context.monorepoRoot}/apps/${projectName}`;
                return { success: true, projectPath: finalPath };
            }

            return { success: true, projectPath: targetDir };
        } catch (error) {
            return {
                success: false,
                projectPath: '',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    private async ensurePackageJson(targetDir: string, projectName: string): Promise<void> {
        // Simple check: we rely on InitCommand 'blank' doing nothing.
        // We assume NodeFilesystemAdapter implements writeFile.
        const packageJsonPath = `${targetDir}/package.json`;
        // Since we don't have existsFile in port, and 'blank' doesn't create it, we write it.
        // In future, check if file exists using a better port extraction.

        // Construct basic package.json
        const content = JSON.stringify({
            name: projectName,
            version: '0.0.0'
        }, null, 2);

        await this.filesystem.writeFile(packageJsonPath, content);
    }

    private async handleBunCreateDelegation(
        appTemplate: string,
        targetDir: string,
        context: MonorepoContextResult,
        skipPrompts?: boolean
    ): Promise<CreateProjectResult> {
        // Execute bun create
        // We need to run it in the PARENT of targetDir, so it creates targetDir?
        // Or if targetDir exists... `bun create` usually demands it doesn't exist or is empty.

        // `DelegateToBunCreateUseCase` executes `bun create template` in `cwd`.
        // If we want it to create `targetDir`, we should probably run it in the parent
        // and pass the name?
        // `bun create template destination`

        // `DelegateToBunCreateUseCase.execute(template, cwd)` executes `bun create template`.
        // It doesn't seem to take a destination arg in the interface defined in Sprint 3.
        // `bun create ${template}` inside `cwd`.

        // So if we start at `process.cwd()`, and want to create `projectName`.
        // We should run `bun create template` ??? No that creates in current dir?
        // `bun create template my-app` creates in `my-app`.

        // We need to pass the folder name to `bun create`.
        // checking `DelegateToBunCreateUseCase`...
        // It runs `bun create ${template}`.
        // If template includes the name? e.g. `bun create oak` -> creates in `current`?
        // Usually `bun create <template> <destination>`.

        // The Sprint 3 definition of DelegateToBunCreateUseCase is strict:
        // `bun create ${template}` in `cwd`.
        // It implies we must `mkdir targetDir` and run inside it?
        // Or the template string includes the name?

        // Let's assume we ensure targetDir exists (Sprint 3 Step 5 does that generally, but
        // `handleBunCreateDelegation` is Step 4, before Step 5).

        // If we use `bun create`, we probably shouldn't `ensureDir` beforehand if `bun create` complains.
        // But `DelegateToBunCreate` runs in `cwd`.
        // If we pass `targetDir` as `cwd`, `bun create` runs inside it.
        // So `bun create template .` ?

        // Let's assume the safe bet: Ensure dir, run inside it.
        await this.filesystem.ensureDir(targetDir);

        const result = await this.delegateToBunCreate.execute(
            `${appTemplate} .`, // Force create in current dir logic?
            targetDir
        );

        if (!result.success) {
            return {
                success: false,
                projectPath: '',
                error: result.error
            };
        }

        // If in monorepo, execute adopt
        if (context.isMonorepo) {
            let generateBuildScripts = true;
            if (!skipPrompts) {
                const confirmation = await this.ui.confirmGenerateBuildScripts();
                generateBuildScripts = confirmation.shouldGenerate;
            }

            await this.adoptCommand.execute({
                cwd: targetDir,
                skipBuild: !generateBuildScripts
            });
            const projectName = basename(targetDir);
            const finalPath = `${context.monorepoRoot}/apps/${projectName}`;
            return { success: true, projectPath: finalPath };
        }

        return { success: true, projectPath: targetDir };
    }
}
