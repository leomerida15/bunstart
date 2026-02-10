# Sprint 1: Create config-state module + adapt config format

**Goal:** Create the `config-state` module with generic config operations. Adapt `BunstartConfigFileAdapter` to read/write the full config with the `.repo` wrapper. Init writes the new format. Everything compiles and works as before.

**Status:** Done

## Tasks

| # | Task | Status | Files |
|---|------|--------|-------|
| 1 | Create `config-state/domain/entities/BunstartConfig.ts` with `BunstartConfig` and `RepoSection` interfaces | done | new |
| 2 | Create `config-state/domain/ports/ConfigStorage.port.ts` with `load(cwd)` and `save(cwd, config)` | done | new |
| 3 | Create `config-state/app/use-cases/LoadConfigUseCase.ts` | done | new |
| 4 | Create `config-state/app/use-cases/InitializeConfigUseCase.ts` | done | new |
| 5 | Create `config-state/app/use-cases/PatchConfigUseCase.ts` (load + deep merge + save) | done | new |
| 6 | Create `config-state/infra/adapters/BunstartConfigFileAdapter.ts` -- reads full config from `.default`, reads `.repo` wrapper; serializes full config with `.repo` | done | new |
| 7 | Create `config-state/infra/factories/ConfigUseCasesFactory.ts` | done | new |
| 8 | Update `repo-state/infra/adapters/BunstartConfigFileAdapter.ts` to read from `.repo` wrapper (backward compat: if no `.repo`, try root-level apps/packages) | done | modify |
| 9 | Update `repo-state` serialize to write with `.repo` wrapper | done | modify |
| 10 | Update `BootstrapBlankMonorepoUseCase` to write config with `.repo` wrapper via `InitializeConfigUseCase` (or via updated repo-state) | done | modify |
| 11 | Update e2e `bunstart.config.ts` if format changed (already has `.repo` wrapper -- verify) | done | verify |
| 12 | Build and verify CLI compiles and runs (`buns --help`, `buns app-example build` from e2e) | done | verify |

## Acceptance criteria

- `config-state/` module exists with LoadConfig, InitializeConfig, PatchConfig use cases.
- `BunstartConfigFileAdapter` reads/writes config with `{ repo: { apps, packages } }` format.
- `buns init` writes `bunstart.config.ts` with the `.repo` wrapper.
- `buns app-example build` (from e2e) still works (loads config, finds alias in `.repo.apps`).
- `buns mono sync` still works.
- 0 lint errors.
- Build succeeds.

## Notes

- repo-state module still exists at end of this sprint (will be removed in sprint 2).
- repo-state's adapter is updated to read the new format so everything keeps working.
- config-state is created but not yet consumed by mono directly (mono still uses repo-state use cases).
