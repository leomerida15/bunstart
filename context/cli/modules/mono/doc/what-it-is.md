# Module: mono

**Path:** `packages/cli/src/modules/mono/`
**Command:** `buns mono <subcommand>` and `buns <alias> <commands...>` (direct run)
**Config section:** `.repo` in `bunstart.config.ts`
**Status:** Partially implemented

## Purpose

Manages monorepo workspaces: generate new apps/packages, build with dependency ordering, run scripts, execute bun commands in workspaces, and sync dependsOn from package.json. Owns all monorepo domain logic (entities, services, ports) and use cases. Depends on `config-state` for config persistence and `init` for scaffolding.

## Architecture

```
mono/
  domain/
    entities/         RepoConfig, AppEntry, PackageEntry
    value-objects/    WorkspaceId
    ports/            RunInWorkspace.port, BuildWorkspace.port
    services/         BuildOrderResolver, WorkspaceResolver
  app/
    MonoCommand.ts
    use-cases/        AddApp, AddPackage, RunInWorkspace, EnsureDepsBuilt, EnsureConfigSynced, SyncDependsOn
  infra/
    adapters/         BunRunInWorkspaceAdapter, BunBuildWorkspaceAdapter, SyncStateFileAdapter
    factories/        MonoCommandFactory
```

Depends on:
- `config-state`: LoadConfigUseCase, PatchConfigUseCase (reads/writes the `.repo` section of bunstart.config.ts).
- `init`: MonorepoScaffolderPort (scaffoldApp, scaffoldPackage).

## Two entry points

### Via `buns mono <subcommand>`

Routed from `index.ts` case `'mono'` -> `MonoCommand.execute(args)`.

### Via `buns <alias> <commands...>` (direct run)

Routed from `index.ts` default case. When the first arg is not a known CLI command (`init`, `mono`, `--help`, etc.), the entrypoint loads config and checks if it is a workspace alias. If yes, it delegates to mono's `RunInWorkspaceUseCase` and `EnsureDepsBuiltUseCase` (exposed via `MonoCommandFactory`).

## Commands table

| # | Command | Via | Status | Description |
|---|---------|-----|--------|-------------|
| 1 | `mono <alias> <commands...>` | `buns mono app-example test` | Pending | Execute any script or bun command in a workspace. Must distinguish scripts from native bun commands. Alias must not collide with reserved names. |
| 2 | `mono start <alias>` | `buns mono start app-example` | Pending | Run start script (like build/dev but with `start`). |
| 3 | `mono <alias> add <pkg>` | `buns mono app-example add lodash` | Pending | Native bun commands (add/install/remove/x/link etc.) in a workspace, without prepending `run`. |
| 4 | `mono remove app\|pkg <name>` | `buns mono remove app my-app` | Pending | Remove workspace from config and optionally delete directory. |
| 5 | `bun install` after generate | `buns mono gen app my-app` | Pending | Run `bun install` after generating a new workspace to resolve it in the lockfile. |
| 6 | Distinguish `run` vs native commands | both entry points | Pending | Do not prepend `run` to native bun commands (`add`, `install`, `remove`, `x`, `link`, `unlink`, `pm`, `outdated`, `update`, `create`). Only prepend `run` for package.json scripts. |
| 7 | `generate app\|pkg <name>` (alias: `gen`) | `buns mono gen app x` | Done | Registers in config + scaffolds directory. |
| 8 | `build <alias>` | `buns mono build app-example` | Done | Builds workspace and dependsOn in topological order. |
| 9 | `dev <alias>` | `buns mono dev app-example` | Done | Runs dev script (builds deps first). |
| 10 | `sync` | `buns mono sync` | Done | Syncs dependsOn from package.json for all workspaces. |

## Reserved names

Workspace aliases (app or package names) must NOT collide with these reserved names. The `generate`/`gen` command and `AddAppUseCase`/`AddPackageUseCase` must validate against this list and reject with a clear error.

**Mono subcommands:**
`generate`, `gen`, `build`, `dev`, `start`, `sync`, `remove`, `add`, `install`

**Global CLI commands:**
`init`, `mono`

**Native bun commands:**
`add`, `install`, `remove`, `pm`, `x`, `create`, `init`, `link`, `unlink`, `outdated`, `update`, `run`

**Flags:**
`help`, `--help`, `-h`, `--version`, `-v`

Combined unique list:
```
generate, gen, build, dev, start, sync, remove, add, install, init, mono,
pm, x, create, link, unlink, outdated, update, run, help, --help, -h, --version, -v
```

This list should live in the domain (e.g. `mono/domain/services/ReservedNames.ts` or as validation in `WorkspaceId`) so it is enforced in a single place.

## Scripts vs native bun commands

When running commands in a workspace, the CLI must distinguish between:

- **Scripts** (defined in package.json `scripts`): `build`, `dev`, `start`, `test`, `lint`, etc. These need `bun run <script>`.
- **Native bun commands**: `add`, `install`, `remove`, `x`, `link`, `unlink`, `pm`, `outdated`, `update`, `create`. These need `bun <command>` directly (no `run` prefix).

The current implementation always prepends `run` (in `index.ts` lines 130-133), which breaks native commands. The fix is to maintain a set of known native bun commands and skip the `run` prefix for those.

```
Native bun commands (do NOT prepend run):
add, install, remove, pm, x, create, init, link, unlink, outdated, update
```

Everything else gets `run` prepended.

## Flow: `mono <alias> <commands...>` (planned)

Example: `buns mono app-example test`

1. MonoCommand.execute receives args `['app-example', 'test']`.
2. `app-example` is not a known subcommand (not `generate`, `build`, `dev`, `sync`, `remove`).
3. Load config, check if `app-example` is a workspace alias in `.repo`.
4. If yes: delegate to `RunInWorkspaceUseCase.execute(cwd, 'app-example', ['run', 'test'])`.
5. If no: show error "Unknown subcommand or workspace".

Example: `buns mono app-example add lodash`

1. Same routing as above.
2. `add` is a native bun command -> pass as `['add', 'lodash']` (no `run` prefix).
3. `RunInWorkspaceUseCase` executes `bun add lodash` in `apps/app-example/`.

## Flow: `buns <alias> <commands...>` (direct run, current)

Example: `buns app-example build`

1. `index.ts` default case: `command = 'app-example'`, `commandArgs = ['build']`.
2. Loads config, checks `isWorkspaceAliasFromConfig(config, 'app-example')` -> true.
3. `build` triggers EnsureDepsBuilt first.
4. Prepends `run` -> `['run', 'build']`.
5. `RunInWorkspaceUseCase.execute(cwd, 'app-example', ['run', 'build'])`.
6. Adapter runs `bun run build` in `apps/app-example/`.

## Flow: `mono generate app my-app`

1. Loads config via LoadConfigUseCase, derives repo section.
2. Derives scope from existing workspace names (WorkspaceResolver.getScope).
3. Validates `my-app` is not a reserved name.
4. Calls AddAppUseCase (loadConfig + patchConfig) -> updates `.repo` section.
5. Calls scaffolder.scaffoldApp(cwd, 'my-app', 'myorg') -> creates `apps/my-app/`.
6. (Pending) Runs `bun install` to resolve the new workspace.

## Flow: `mono build app-example`

1. Loads config, gets repo section.
2. **EnsureConfigSyncedUseCase.execute(cwd)** — if no `.bunstart/sync-state.json` or any workspace `package.json` has mtime greater than lastSyncTime, runs sync for all workspaces (same as `mono sync`) and writes state. Keeps bunstart.config.ts dependsOn in sync without requiring the user to run `mono sync` manually.
3. EnsureDepsBuiltUseCase.execute(cwd, 'app-example') -> BuildOrderResolver, then BunBuildWorkspaceAdapter per dependency.
4. RunInWorkspaceUseCase.execute(cwd, 'app-example', ['run', 'build']).

## What is done

- Full domain in mono (RepoConfig, AppEntry, PackageEntry, WorkspaceResolver, BuildOrderResolver).
- Use cases use config-state (LoadConfig, PatchConfig) for persistence of `.repo` section.
- generate/gen, build, dev, sync subcommands.
- MonoCommandFactory wires config-state + mono use cases; exposes createEnsureDepsBuiltUseCase(), createRunInWorkspaceUseCase(), and createEnsureConfigSyncedUseCase() for index.ts run routing.
- Before build/dev/start (both `buns mono build <alias>` and `buns <alias> build`), EnsureConfigSyncedUseCase runs when needed (first run or package.json changed) so bunstart.config.ts dependsOn stay in sync without manual `mono sync`.
- Direct run via `buns <alias> <commands>` works for scripts (build, dev).

## What is missing / TODO

- **#1 Generic `mono <alias> <commands>`:** Fallthrough in MonoCommand currently just logs. Should check if subcommand is a workspace alias and delegate to RunInWorkspaceUseCase.
- **#2 `start` subcommand:** Recognized but not wired. Should work like build/dev.
- **#3 Native bun commands in workspace:** `buns mono app-example add lodash` must not prepend `run`. Requires native command detection.
- **#4 `remove app|pkg <name>`:** Not implemented. Should remove from config and optionally delete directory.
- **#5 `bun install` after generate:** Generate does not run `bun install` to resolve the new workspace.
- **#6 Run vs native distinction:** Both entry points (index.ts and MonoCommand) always prepend `run`. Must skip for native bun commands.
- **#7 Reserved name validation:** `generate`/`AddApp`/`AddPackage` do not validate workspace names against reserved names. Could create conflicts.
- **Tests:** No unit tests for MonoCommand, use cases, or domain services.
