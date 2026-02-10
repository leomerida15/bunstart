# Sprint 1: Capa de Dominio — Puertos y Entidades para `create`

**Goal:** Definir los puertos (interfaces) y entidades necesarias para el comando `create` en la capa de dominio, siguiendo los principios de Arquitectura Hexagonal.

**Status:** Completed

## Puertos a crear

### 1. `MonorepoContext.port.ts`

Puerto para detectar el contexto de monorepo.

```typescript
/**
 * Result of checking if we're in a monorepo context.
 *
 * @interface MonorepoContextResult
 */
export interface MonorepoContextResult {
  /** Whether we're inside a monorepo */
  isMonorepo: boolean;
  /** Path to the monorepo root if inside, null otherwise */
  monorepoRoot: string | null;
}

/**
 * Port interface for detecting monorepo context.
 *
 * This port defines the contract for detecting whether the current
 * working directory is inside a bunstart monorepo.
 *
 * @interface MonorepoContextPort
 */
export interface MonorepoContextPort {
  /**
   * Checks if the current directory is inside a monorepo.
   * Searches for bunstart.config.ts in current or ancestor directories.
   *
   * @param {string} cwd - Current working directory
   * @returns {Promise<MonorepoContextResult>}
   */
  detectContext(cwd: string): Promise<MonorepoContextResult>;
}
```

### 2. Extensión de `UserInterface.port.ts`

Añadir método para confirmar generación de scripts build/watch.

```typescript
/**
 * Result of confirming build scripts generation.
 *
 * @interface BuildScriptsConfirmation
 */
export interface BuildScriptsConfirmation {
  /** Whether to generate bunstart.build.ts and bunstart.watch.ts */
  shouldGenerate: boolean;
}

/**
 * Extended port interface for user interactions in create command.
 *
 * @interface UserInterfacePort
 */
export interface UserInterfacePort {
  // ... existing methods ...

  /**
   * Prompts the user to confirm if they want to generate bunstart.build.ts
   * and bunstart.watch.ts scripts.
   *
   * @param {string} [message] - The prompt message to display
   * @returns {Promise<BuildScriptsConfirmation>} The user's choice
   */
  confirmGenerateBuildScripts(
    message?: string
  ): Promise<BuildScriptsConfirmation>;
}
```

### 3. Puerto de procesos (Process.port.ts)

Puerto para ejecutar comandos shell (delegación a `bun create`).

```typescript
/**
 * Result of executing a shell command.
 *
 * @interface ProcessResult
 */
export interface ProcessResult {
  /** Exit code of the command */
  exitCode: number;
  /** Standard output */
  stdout: string;
  /** Standard error */
  stderr: string;
}

/**
 * Port interface for executing shell commands.
 *
 * @interface ProcessPort
 */
export interface ProcessPort {
  /**
   * Executes a shell command.
   *
   * @param {string} command - The command to execute
   * @param {string} cwd - Working directory for execution
   * @returns {Promise<ProcessResult>}
   */
  exec(command: string, cwd: string): Promise<ProcessResult>;
}
```

## Entidades y Value Objects

### 1. `CreateCommandOptions.ts`

Opciones del comando create.

```typescript
/**
 * Options for the create command.
 *
 * @interface CreateCommandOptions
 */
export interface CreateCommandOptions {
  /** Project name (optional, will prompt if not provided) */
  projectName?: string;
  /** App template to use with bun create (optional) */
  appTemplate?: string;
  /** Whether to skip prompting (batch mode) */
  skipPrompts?: boolean;
  /** Whether to generate build/watch scripts (undefined = ask user) */
  generateBuildScripts?: boolean;
  /** Working directory */
  cwd?: string;
}
```

## Tasks

| # | Task | Status | Files |
|---|------|--------|-------|
| 1 | Create `init/domain/ports/MonorepoContext.port.ts` | pending | new |
| 2 | Extend `init/domain/ports/UserInterface.port.ts` with `confirmGenerateBuildScripts()` | pending | modify |
| 3 | Create `init/domain/ports/Process.port.ts` | pending | new |
| 4 | Create `init/domain/entities/CreateCommandOptions.ts` | pending | new |

## Acceptance criteria

- `MonorepoContextPort.detectContext()` retorna `{ isMonorepo, monorepoRoot }`
- `UserInterfacePort.confirmGenerateBuildScripts()` retorna `{ shouldGenerate }`
- `ProcessPort.exec()` retorna `{ exitCode, stdout, stderr }`
- Todos los puertos están documentados con JSDoc
- 0 lint errors. Build succeeds.

## Notes

- La detección de monorepo busca `bunstart.config.ts` en el directorio actual y ancestros
- Los puertos siguen el principio de Dependency Inversion (definidos en dominio, implementados en infraestructura)
