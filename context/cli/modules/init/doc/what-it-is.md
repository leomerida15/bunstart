# Module: init

**Path:** `packages/cli/src/modules/init/`
**Command:** `buns init`
**Status:** Partially implemented (monorepo template only)

## Purpose

Bootstraps new projects from templates. The user runs `buns init`, selects a template type via an interactive prompt, and the module scaffolds the full project structure (config files, workspaces, example code) and writes initial config. It is the entry point for creating a new repo from scratch, as opposed to adding workspaces to an existing monorepo (handled by the mono module).

## Architecture

```
init/
  domain/
    entities/        MonorepoConfig, Template
    value-objects/   MonorepoAlias, TemplateType
    ports/           BunRuntime.port, Filesystem.port, MonorepoScaffolder.port,
                     PackageJson.port, UserInterface.port
    services/        TemplateDefinitions
  app/
    InitCommand.ts
    use-cases/       SelectTemplateUseCase, BootstrapBlankMonorepoUseCase
  infra/
    adapters/        BunRuntimeAdapter, EnquirerAdapter, MonorepoScaffolderAdapter,
                     NodeFilesystemAdapter, PackageJsonAdapter
    factories/       InitCommandFactory
```

Depends on:
- **config-state:** InitializeConfigUseCase (writes initial `bunstart.config.ts` with `.repo` after scaffold).
- **mono (domain only):** createAppEntry, createPackageEntry, createRepoConfig (to build initial repo config for the bootstrapped monorepo).

The **mono** module depends on **init** for MonorepoScaffolderPort (scaffoldApp, scaffoldPackage) when running `mono generate app|pkg`; the adapter lives in init’s infra (MonorepoScaffolderAdapter).

## Entry point

Routed from `index.ts`: when the user runs `buns init`, the CLI calls `InitCommandFactory.create()` then `initCommand.execute()`. No arguments are passed; the flow is fully interactive (template selection, then alias prompt for monorepo).

## Flow: `buns init` (current)

1. **InitCommand.execute()** prints a short message and calls **SelectTemplateUseCase.execute()**.
2. **SelectTemplateUseCase** uses TemplateDefinitions to get available templates and **UserInterfacePort** (EnquirerAdapter) to prompt the user to choose one. Returns the selected Template or null if cancelled.
3. If template type is `monorepo`, **BootstrapBlankMonorepoUseCase.execute(cwd)** runs:
   - **BunRuntimePort.initBlank(cwd)** — runs `bun init -y` (or equivalent) in the current directory.
   - **UserInterfacePort.askAlias(...)** — prompts for monorepo alias (e.g. `myorg` or `@myorg`).
   - **MonorepoAlias.fromString** / **MonorepoConfig.create** — build config (scope, example app/package names).
   - **MonorepoScaffolderPort.scaffold(config, cwd)** — creates root package.json, workspaces layout (apps/, packages/), example app and package (app-example, pkg-example), bunstart.build.ts, bunstart.watch.ts, tsconfig, src files. Uses templates under `src/utils/template/monorepo/` with alias interpolation.
   - Build initial **BunstartConfig** (repo.apps, repo.packages with one app and one package) and call **InitializeConfigUseCase.execute(cwd, bunstartConfig)** to write `bunstart.config.ts`.
   - **BunRuntimePort.installDependencies(cwd)** — runs `bun install` at root.
4. If template type is not monorepo (api-rest, frontend-react, library), InitCommand currently logs "Configuring project..." and exits; no use case is implemented yet.

## Templates defined

| Type           | Name           | Description                                      | Implemented |
|----------------|----------------|--------------------------------------------------|-------------|
| monorepo       | Mono Repo      | Multi-package workspace with apps and packages   | Yes         |
| api-rest       | API REST       | RESTful API server with Bun runtime              | No          |
| frontend-react | Frontend React | React application with Vite and Bun             | No          |
| library        | Library        | Reusable TypeScript library package              | No          |

Definitions live in **TemplateDefinitions.getAllTemplates()**; only the monorepo type is handled in InitCommand.

## What is done

- **InitCommand** and **InitCommandFactory** with dependency injection.
- **SelectTemplateUseCase** — template list + interactive choice via UserInterfacePort.
- **BootstrapBlankMonorepoUseCase** — bun init, alias prompt, scaffold via MonorepoScaffolderPort, write config via config-state’s InitializeConfigUseCase, bun install.
- **MonorepoScaffolderAdapter** — scaffold(config, cwd) for full monorepo; also implements scaffoldApp(cwd, name, scope) and scaffoldPackage(cwd, name, scope) used by **mono** when running `buns mono generate app|pkg <name>`.
- Templates under `src/utils/template/monorepo/` (apps/app-example, packages/pkg-example, root files) with placeholder substitution (e.g. scope/alias).
- Ports and adapters: BunRuntime (init + install), UserInterface (Enquirer), Filesystem, PackageJson, MonorepoScaffolder. Integration with config-state for initial bunstart.config.ts.

## What is missing / TODO

- **Other template types:** api-rest, frontend-react, library are defined but not implemented. Need a bootstrap use case per type (or a generic bootstrap that delegates by type), scaffold templates in `src/utils/template/<type>/`, and wiring in InitCommand.
- **Tests:** Unit tests for SelectTemplateUseCase, BootstrapBlankMonorepoUseCase, and adapters.
- **Optional:** Non-interactive or flags (e.g. `buns init --template monorepo --alias myorg`) for scripts/CI; currently init is interactive only.
