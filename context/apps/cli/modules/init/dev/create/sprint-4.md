# Sprint 4: Integración y Punto de Entrada CLI para `create`

**Goal:** Crear el comando CLI `create` y wire toda la arquitectura hexagonal.

**Status:** Pending

## Archivos a crear/modificar

### 1. `CreateCommand.ts`

Comando CLI principal para `create`.

```typescript
import { CreateCommandOptions } from '../domain/entities/CreateCommandOptions';
import { CreateProjectUseCase } from '../use-cases/CreateProjectUseCase';
import { CreateUseCasesFactory } from '../factories/CreateUseCasesFactory';

/**
 * CLI Command for creating new projects.
 *
 * This command provides:
 * - Wrapper for init with folder creation
 * - Wrapper for bun create with optional app template
 * - Automatic adoption in monorepo contexts
 *
 * @class CreateCommand
 */
export class CreateCommand {
  /**
   * Creates an instance of CreateCommand.
   *
   * @param {CreateProjectUseCase} createProjectUseCase - Use case for project creation
   */
  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase
  ) {}

  /**
   * Executes the create command.
   *
   * @param {string[]} args - Command arguments
   * @param {string} cwd - Current working directory
   * @returns {Promise<void>}
   */
  async execute(args: string[], cwd: string): Promise<void> {
    // Parse arguments
    const options = this.parseArgs(args, cwd);

    // Execute create flow
    const result = await this.createProjectUseCase.execute(options);

    if (result.success) {
      console.log(`✅ Proyecto creado en: ${result.projectPath}`);
    } else {
      console.error(`❌ Error: ${result.error}`);
      process.exit(1);
    }
  }

  /**
   * Parses command arguments into options.
   *
   * @param {string[]} args - Command arguments
   * @param {string} cwd - Current working directory
   * @returns {CreateCommandOptions}
   */
  private parseArgs(args: string[], cwd: string): CreateCommandOptions {
    const options: CreateCommandOptions = {
      cwd,
    };

    // First positional argument is app template
    const firstArg = args[0];
    if (firstArg && !firstArg.startsWith('-')) {
      options.appTemplate = firstArg;
    }

    // Parse flags
    if (args.includes('--skip-build')) {
      options.generateBuildScripts = false;
    }

    if (args.includes('--yes') || args.includes('-y')) {
      options.skipPrompts = true;
      if (options.generateBuildScripts === undefined) {
        options.generateBuildScripts = true; // Default to yes
      }
    }

    return options;
  }

  /**
   * Returns command help text.
   *
   * @returns {string}
   */
  static getHelp(): string {
    return `
Usage: bunstart create [app] [options]

Create a new project with bunstart conventions.

Arguments:
  app                 Bun create template (e.g., next-app, react)

Options:
  --skip-build        Skip generating bunstart.build.ts and bunstart.watch.ts
  --yes, -y           Skip prompts, use defaults
  --help              Show this help

Examples:
  bunstart create                      # Interactive mode
  bunstart create next-app             # Create Next.js app
  bunstart create next-app --skip-build # Create without bunstart scripts
`;
  }
}
```

### 2. `CreateCommandFactory.ts`

Fábrica para crear instancias de `CreateCommand`.

```typescript
import { CreateCommand } from './CreateCommand';
import { CreateProjectUseCase } from './CreateProjectUseCase';
import { CreateUseCasesFactory } from './CreateUseCasesFactory';
import { InitCommandFactory } from '../../init/infra/factories/InitCommandFactory';
import { AdoptCommandFactory } from '../../../mono/infra/factories/AdoptCommandFactory';
import { NodeFilesystemAdapter } from '../../init/infra/adapters/NodeFilesystemAdapter';
import { EnquirerAdapter } from '../../init/infra/adapters/EnquirerAdapter';
import { MonorepoContextAdapter } from '../../init/infra/adapters/MonorepoContextAdapter';
import { ProcessAdapter } from '../../init/infra/adapters/ProcessAdapter';

/**
 * Factory for creating CreateCommand instances.
 *
 * This factory wires all dependencies following the hexagonal architecture,
 * allowing easy testing and swapping of implementations.
 *
 * @class CreateCommandFactory
 */
export class CreateCommandFactory {
  private initFactory: InitCommandFactory;
  private adoptFactory: AdoptCommandFactory;
  private useCasesFactory: CreateUseCasesFactory;

  /**
   * Creates an instance of CreateCommandFactory.
   */
  constructor() {
    // Infrastructure adapters
    const filesystem = new NodeFilesystemAdapter();
    const ui = new EnquirerAdapter();
    const process = new ProcessAdapter();
    const monorepoContext = new MonorepoContextAdapter(filesystem);

    // Init and Adopt factories
    this.initFactory = new InitCommandFactory();
    this.adoptFactory = new AdoptCommandFactory();

    // Use cases factory
    this.useCasesFactory = new CreateUseCasesFactory(
      monorepoContext,
      ui,
      filesystem,
      process,
      this.initFactory,
      this.adoptFactory
    );
  }

  /**
   * Creates a new CreateCommand instance.
   *
   * @returns {CreateCommand}
   */
  create(): CreateCommand {
    const createProjectUseCase = this.useCasesFactory.createCreateProjectUseCase();
    return new CreateCommand(createProjectUseCase);
  }
}
```

### 3. `CreateUseCasesFactory.ts`

Fábrica para los casos de uso de create.

```typescript
import { CreateProjectUseCase } from './CreateProjectUseCase';
import { DelegateToBunCreateUseCase } from './DelegateToBunCreateUseCase';
import { MonorepoContextPort } from '../../domain/ports/MonorepoContext.port';
import { UserInterfacePort } from '../../domain/ports/UserInterface.port';
import { FilesystemPort } from '../../domain/ports/Filesystem.port';
import { ProcessPort } from '../../domain/ports/Process.port';
import { InitCommandFactory } from '../../init/infra/factories/InitCommandFactory';
import { AdoptCommandFactory } from '../../../mono/infra/factories/AdoptCommandFactory';

/**
 * Factory for creating create-related use cases.
 *
 * @class CreateUseCasesFactory
 */
export class CreateUseCasesFactory {
  /**
   * Creates an instance of CreateUseCasesFactory.
   *
   * @param {MonorepoContextPort} monorepoContext
   * @param {UserInterfacePort} ui
   * @param {FilesystemPort} filesystem
   * @param {ProcessPort} process
   * @param {InitCommandFactory} initFactory
   * @param {AdoptCommandFactory} adoptFactory
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
   * Creates a CreateProjectUseCase instance.
   *
   * @returns {CreateProjectUseCase}
   */
  createCreateProjectUseCase(): CreateProjectUseCase {
    return new CreateProjectUseCase(
      this.monorepoContext,
      this.ui,
      this.filesystem,
      this.process,
      this.initFactory,
      this.adoptFactory
    );
  }

  /**
   * Creates a DelegateToBunCreateUseCase instance.
   *
   * @returns {DelegateToBunCreateUseCase}
   */
  createDelegateToBunCreateUseCase(): DelegateToBunCreateUseCase {
    return new DelegateToBunCreateUseCase(this.process);
  }
}
```

## Integración en CLI

### 4. Modificar `packages/cli/src/index.ts`

```typescript
// Añadir imports
import { CreateCommandFactory } from './modules/init/infra/factories/CreateCommandFactory';

// En el router/switch de comandos
case 'create':
  const createFactory = new CreateCommandFactory();
  const createCommand = createFactory.create();
  await createCommand.execute(args, process.cwd());
  break;
```

## Tasks

| # | Task | Status | Files |
|---|------|--------|-------|
| 1 | Create `init/app/CreateCommand.ts` | pending | new |
| 2 | Create `init/infra/factories/CreateCommandFactory.ts` | pending | new |
| 3 | Create `init/infra/factories/CreateUseCasesFactory.ts` | pending | new |
| 4 | Modificar `AdoptCommand` para soportar `--skip-build` | pending | modify |
| 5 | Modificar `packages/cli/src/index.ts` para integrar `create` | pending | modify |
| 6 | Añadir tests E2E para los 4 flujos | pending | new |

## Acceptance criteria

- `bunstart create` ejecuta el flujo interactivo correctamente
- `bunstart create next-app` delega a `bun create`
- En monorepo, ejecuta `adopt` automáticamente
- `--skip-build` omite bunstart.build.ts y bunstart.watch.ts
- Todos los flujos de la especificación funcionan correctamente
- 0 lint errors. Build succeeds.

## E2E Tests

```typescript
// e2e/create.test.ts

import { test, expect } from 'bun:test';
import { tempDir, cleanup } from './utils';

test('bunstart create (standalone) - creates project in new folder', async () => {
  // Arrange
  const { path, cleanup: cleanupDir } = await tempDir();

  // Act
  // Execute: bunstart create my-app

  // Assert
  // - my-app/ directory exists
  // - Contains init files
  // - bunstart.build.ts exists (unless --skip-build)

  await cleanupDir();
});

test('bunstart create next-app (standalone) - delegates to bun create', async () => {
  // Act
  // Execute: bunstart create next-app

  // Assert
  // - bun create was called
  // - Next.js app created
});

test('bunstart create (monorepo) - executes adopt', async () => {
  // Arrange
  // Setup monorepo with bunstart.config.ts

  // Act
  // Execute: bunstart create my-app

  // Assert
  // - my-app/ created in monorepo/apps
  // - adopt was executed
  // - bunstart.config.ts updated
});

test('bunstart create --skip-build - skips build scripts', async () => {
  // Act
  // Execute: bunstart create my-app --skip-build

  // Assert
  // - my-app/ created
  // - bunstart.build.ts does NOT exist
  // - bunstart.watch.ts does NOT exist
});
```
