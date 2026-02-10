# Module: init

**Path:** `packages/cli/src/modules/init/`
**Command:** `buns init`
**Status:** Partially implemented

## Purpose

Bootstraps new projects from templates. Prompts the user to select a template type and scaffolds the full project structure including config files, scripts, and example code.

## Architecture

```
init/
  domain/
    entities/        MonorepoConfig, Template
    value-objects/   MonorepoAlias, TemplateType
    ports/           BunRuntime, Filesystem, MonorepoScaffolder, PackageJson, UserInterface
    services/        TemplateDefinitions
  app/
    InitCommand.ts
    use-cases/       SelectTemplateUseCase, BootstrapBlankMonorepoUseCase
  infra/
    adapters/        BunRuntimeAdapter, EnquirerAdapter, MonorepoScaffolderAdapter, NodeFilesystemAdapter, PackageJsonAdapter
    factories/       InitCommandFactory
```

## Flow

1. `InitCommand.execute()` calls `SelectTemplateUseCase` to prompt the user for a template.
2. Based on selected template type, dispatches to the corresponding use case.
3. For monorepo: `BootstrapBlankMonorepoUseCase` runs `bun init -y`, asks for alias, scaffolds structure (apps/packages dirs, example app/pkg, config files), writes `bunstart.config.ts` via `InitializeRepoStateUseCase` (from repo-state module), and runs `bun install`.

## Templates defined

| Type             | Name           | Description                                 |
|------------------|----------------|---------------------------------------------|
| monorepo         | Mono Repo      | Multi-package workspace with apps and pkgs  |
| api-rest         | API REST       | RESTful API server with Bun runtime         |
| frontend-react   | Frontend React | React application with Vite and Bun         |
| library          | Library        | Reusable TypeScript library package         |

## What is done

- Full monorepo template: scaffold root package.json, apps/app-example, packages/pkg-example, bunstart.build.ts, bunstart.watch.ts, tsconfig, src/index.ts.
- Integration with repo-state: writes initial `bunstart.config.ts` after scaffold.
- Scaffolder supports `scaffoldApp(cwd, id, scope)` and `scaffoldPackage(cwd, id, scope)` for single workspace generation (used by mono generate).
- Template files in `src/utils/template/monorepo/` with `{{ALIAS}}` interpolation.

## What is missing / TODO

- **api-rest template:** Not implemented. `InitCommand` logs "Configuring project..." and exits. Needs a `BootstrapApiRestUseCase` (or similar), scaffold templates in `src/utils/template/api-rest/`, and adapters.
- **frontend-react template:** Not implemented. Same pattern as api-rest.
- **library template:** Not implemented. Same pattern as api-rest.
- **Template cleanup:** The `scaffoldApp`/`scaffoldPackage` methods replace the example name in the template files (e.g. `app-example` -> `my-app`), but templates may still reference `pkg-example` in dependencies. Consider making template dependencies configurable.
- **Tests:** No unit tests for init use cases or adapters.
