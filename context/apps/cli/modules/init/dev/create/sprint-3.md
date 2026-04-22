# Sprint 3: Capa de Aplicación — Casos de Uso para `create`

**Goal:** Implementar los casos de uso que orquestan la lógica de negocio del comando `create`.

**Status:** Pending

## Casos de Uso a crear

### 1. `CreateProjectUseCase.ts`

Caso de uso principal que orquesta la creación de proyectos.

```typescript
import { CreateCommandOptions } from '../../domain/entities/CreateCommandOptions';
import { MonorepoContextPort } from '../../domain/ports/MonorepoContext.port';
import { UserInterfacePort } from '../../domain/ports/UserInterface.port';
import { FilesystemPort } from '../../domain/ports/Filesystem.port';
import { ProcessPort } from '../../domain/ports/Process.port';
import { InitCommandFactory } from '../factories/InitCommandFactory';
import { AdoptCommandFactory } from '../../../mono/infra/factories/AdoptCommandFactory';

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
  /**
   * Creates an instance of CreateProjectUseCase.
   *
   * @param {MonorepoContextPort} monorepoContext - Monorepo context detector
   * @param {UserInterfacePort} ui - User interface for prompts
   * @param {FilesystemPort} filesystem - Filesystem operations
   * @param {ProcessPort} process - Process execution
   * @param {InitCommandFactory} initFactory - Factory for init command
   * @param {AdoptCommandFactory} adoptFactory - Factory for adopt command
   */
  constructor(
    private readonly monorepoContext: MonorepoContextPort,
    private readonly ui: UserInterfacePort,
    private readonly filesystem: FilesystemPort,
    private readonly process: ProcessPort,
    private readonly initFactory: InitCommandFactory,
    private readonly adoptFactory: AdoptCommandFactory
  ) {}

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
        projectName = await this.ui.promptProjectName(
          'Nombre del proyecto:',
          undefined
        );
        if (!projectName) {
          return { success: false, projectPath: '', error: 'Cancelled' };
        }
      }

      // 3. Determine target directory
      const targetDir = context.isMonorepo
        ? `${context.monorepoRoot}/${projectName}`
        : `${process.cwd()}/${projectName}`;

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

      // 7. Execute init or adopt based on context
      if (context.isMonorepo) {
        await this.executeAdopt(targetDir, generateBuildScripts ?? false);
      } else {
        await this.executeInit(targetDir, projectName);
      }

      return { success: true, projectPath: targetDir };
    } catch (error) {
      return {
        success: false,
        projectPath: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async handleBunCreateDelegation(
    appTemplate: string,
    targetDir: string,
    context: MonorepoContextResult,
    skipPrompts?: boolean
  ): Promise<CreateProjectResult> {
    // Execute bun create
    const result = await this.process.exec(
      `bun create ${appTemplate}`,
      process.cwd()
    );

    if (result.exitCode !== 0) {
      return {
        success: false,
        projectPath: '',
        error: `bun create failed: ${result.stderr}`,
      };
    }

    // If in monorepo, execute adopt
    if (context.isMonorepo) {
      let generateBuildScripts = true;
      if (!skipPrompts) {
        const confirmation = await this.ui.confirmGenerateBuildScripts();
        generateBuildScripts = confirmation.shouldGenerate;
      }

      await this.executeAdopt(targetDir, generateBuildScripts);
    }

    return { success: true, projectPath: targetDir };
  }

  private async executeAdopt(targetDir: string, generateBuildScripts: boolean): Promise<void> {
    const adoptCommand = this.adoptFactory.create();
    await adoptCommand.execute({
      cwd: targetDir,
      skipBuild: !generateBuildScripts,
    });
  }

  private async executeInit(targetDir: string, projectName: string): Promise<void> {
    const initCommand = this.initFactory.create();
    await initCommand.execute({
      name: projectName,
      template: 'blank', // Default template for create
      cwd: targetDir,
    });
  }
}
```

### 2. `DelegateToBunCreateUseCase.ts`

Caso de uso específico para delegar a `bun create`.

```typescript
import { ProcessPort } from '../../domain/ports/Process.port';

/**
 * Use case for delegating to bun create command.
 *
 * @class DelegateToBunCreateUseCase
 */
export class DelegateToBunCreateUseCase {
  /**
   * Creates an instance of DelegateToBunCreateUseCase.
   *
   * @param {ProcessPort} process - Process execution port
   */
  constructor(private readonly process: ProcessPort) {}

  /**
   * Executes bun create with the given template.
   *
   * @param {string} template - Bun create template name
   * @param {string} cwd - Working directory
   * @returns {Promise<{ success: boolean; error?: string }>}
   */
  async execute(
    template: string,
    cwd: string
  ): Promise<{ success: boolean; error?: string }> {
    const result = await this.process.exec(`bun create ${template}`, cwd);

    if (result.exitCode !== 0) {
      return {
        success: false,
        error: `bun create failed: ${result.stderr}`,
      };
    }

    return { success: true };
  }
}
```

## Tasks

| # | Task | Status | Files |
|---|------|--------|-------|
| 1 | Create `init/app/use-cases/CreateProjectUseCase.ts` | pending | new |
| 2 | Create `init/app/use-cases/DelegateToBunCreateUseCase.ts` | pending | new |
| 3 | Extend `mono/infra/factories/AdoptCommandFactory.ts` to support options | pending | modify |
| 4 | Extend `AdoptCommand` to support `--skip-build` flag | pending | modify |
| 5 | Add `CreateUseCasesFactory.ts` | pending | new |

## Acceptance criteria

- `CreateProjectUseCase.execute()` maneja los 4 flujos de la especificación
- `DelegateToBunCreateUseCase.execute()` ejecuta `bun create` correctamente
- `AdoptCommand` soporta flag `--skip-build`
- Casos de uso orquestan sin lógica de infraestructura
- 0 lint errors. Build succeeds.

## Notes

- `CreateProjectUseCase` es el caso de uso principal que orquesta todo
- Los otros casos de uso pueden ser privados o internos al `CreateProjectUseCase`
- La fábrica de adopt debe recibir opciones para el flag `--skip-build`
