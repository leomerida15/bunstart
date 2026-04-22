# Sprint 2: Capa de Infraestructura — Adaptadores para `create`

**Goal:** Implementar los adaptadores que satisfacen los puertos definidos en el Sprint 1.

**Status:** Pending

## Adaptadores a crear

### 1. `MonorepoContextAdapter.ts`

Implementación de `MonorepoContextPort` que busca `bunstart.config.ts`.

```typescript
/**
 * Adapter for detecting monorepo context.
 *
 * This adapter implements MonorepoContextPort by searching for
 * bunstart.config.ts in the current directory and its ancestors.
 *
 * @class MonorepoContextAdapter
 */
export class MonorepoContextAdapter implements MonorepoContextPort {
  /**
   * Creates an instance of MonorepoContextAdapter.
   *
   * @param {FilesystemPort} filesystem - Filesystem port for file operations
   */
  constructor(private readonly filesystem: FilesystemPort) {}

  async detectContext(cwd: string): Promise<MonorepoContextResult> {
    let currentPath = cwd;
    const maxDepth = 10; // Prevent infinite loops

    for (let depth = 0; depth < maxDepth; depth++) {
      const configPath = `${currentPath}/bunstart.config.ts`;
      const exists = await this.filesystem.existsFile(configPath);

      if (exists) {
        return {
          isMonorepo: true,
          monorepoRoot: currentPath,
        };
      }

      const parent = this.getParentPath(currentPath);
      if (parent === currentPath) break; // Reached root
      currentPath = parent;
    }

    return {
      isMonorepo: false,
      monorepoRoot: null,
    };
  }

  private getParentPath(path: string): string {
    const segments = path.split('/');
    segments.pop();
    return segments.join('/') || '/';
  }
}
```

### 2. Extensión de `EnquirerAdapter.ts`

Implementación del método `confirmGenerateBuildScripts()`.

```typescript
// En init/infra/adapters/EnquirerAdapter.ts

import enquirer from 'enquirer';

/**
 * Prompts user to confirm build scripts generation.
 *
 * @returns {Promise<BuildScriptsConfirmation>}
 */
async confirmGenerateBuildScripts(
  message?: string
): Promise<BuildScriptsConfirmation> {
  const defaultMessage =
    '¿Generar scripts bunstart.build.ts/bunstart.watch.ts?';

  const { generate } = await enquirer.prompt<{ generate: boolean }>({
    type: 'confirm',
    name: 'generate',
    message: message || defaultMessage,
    initial: true,
  });

  return { shouldGenerate: generate };
}
```

### 3. `ProcessAdapter.ts`

Implementación de `ProcessPort` usando `Bun.spawn` o similar.

```typescript
/**
 * Adapter for executing shell processes.
 *
 * This adapter implements ProcessPort using Bun's native
 * process execution capabilities.
 *
 * @class ProcessAdapter
 */
export class ProcessAdapter implements ProcessPort {
  async exec(command: string, cwd: string): Promise<ProcessResult> {
    const process = Bun.spawn(command.split(' '), {
      cwd,
      stdout: 'pipe',
      stderr: 'pipe',
    });

    const stdout = await new Response(process.stdout).text();
    const stderr = await new Response(process.stderr).text();
    const exitCode = await process.exitCode;

    return {
      exitCode,
      stdout,
      stderr,
    };
  }
}
```

## Tasks

| # | Task | Status | Files |
|---|------|--------|-------|
| 1 | Create `init/infra/adapters/MonorepoContextAdapter.ts` | pending | new |
| 2 | Extend `init/infra/adapters/EnquirerAdapter.ts` with `confirmGenerateBuildScripts()` | pending | modify |
| 3 | Create `init/infra/adapters/ProcessAdapter.ts` | pending | new |
| 4 | Export new adapters from `init/infra/adapters/index.ts` | pending | modify |

## Acceptance criteria

- `MonorepoContextAdapter.detectContext()` encuentra `bunstart.config.ts` en ancestros
- `EnquirerAdapter.confirmGenerateBuildScripts()` retorna la decisión del usuario
- `ProcessAdapter.exec()` ejecuta comandos y retorna exitCode, stdout, stderr
- Tests unitarios para `MonorepoContextAdapter` (casos: monorepo, no monorepo, root)
- 0 lint errors. Build succeeds.

## Notes

- `MonorepoContextAdapter` puede reutilizar `NodeFilesystemAdapter` ya existente
- Para buscar en ancestros, usar un bucle con límite de profundidad para evitar loops infinitos
- `ProcessAdapter` usa `Bun.spawn` que es más eficiente que `child_process`
