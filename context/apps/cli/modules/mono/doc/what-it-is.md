# Module: mono

**Path:** `packages/cli/src/modules/mono/`
**Command:** `buns mono <subcommand>` and `buns <alias> <commands...>` (direct run)
**Config section:** `.repo` in `bunstart.config.ts`
**Workspace source:** `package.json` field `workspaces` (Bun monorepo standard)
**Status:** Implemented (core flows, dep commands, adopt in-place and from path)

## Purpose

Manages monorepo workspaces: generate new apps/packages, adopt existing projects (in-place or from an external path), build with dependency ordering, run scripts, execute bun commands in workspaces, add/remove workspace dependencies, and sync dependsOn from package.json. Owns all monorepo domain logic (entities, services, ports) and use cases. Workspaces are resolved from `package.json` (field `workspaces`); `bunstart.config.ts` provides `dependsOn` and metadata. Depends on `config-state` for config persistence and `init` for scaffolding (PackageJsonPort, FilesystemPort, MonorepoScaffolderPort).

## Architecture

```
mono/
  domain/
    entities/         RepoConfig, AppEntry, PackageEntry
    value-objects/    WorkspaceId, ResolvedWorkspace
    ports/            RunInWorkspace.port, BuildWorkspace.port, SyncState.port,
                      ResolveWorkspaces.port
    services/         BuildOrderResolver, WorkspaceResolver, ReservedNames, NativeBunCommands
  app/
    MonoCommand.ts
    use-cases/        AddApp, AddPackage, RemoveApp, RemovePackage, AdoptProject,
                      RunInWorkspace, EnsureDepsBuilt, EnsureConfigSynced, SyncDependsOn,
                      AddWorkspaceDep, RemoveWorkspaceDep
  infra/
    adapters/         BunRunInWorkspaceAdapter, BunBuildWorkspaceAdapter, SyncStateFileAdapter,
                      PackageJsonWorkspacesAdapter
    factories/        MonoCommandFactory
```

Depends on:
- `config-state`: LoadConfigUseCase, PatchConfigUseCase (reads/writes the `.repo` section of bunstart.config.ts).
- `init`: MonorepoScaffolderPort (scaffoldApp, scaffoldPackage), PackageJsonPort (read/patch package.json), FilesystemPort (ensureDir, existsDir, copyDirectory for adopt from path).

## Workspace resolution

Workspaces are resolved via `ResolveWorkspacesPort` (implemented by `PackageJsonWorkspacesAdapter`):

1. Reads root `package.json` field `workspaces` (e.g. `["apps/*", "packages/*", "libs/*"]`).
2. Resolves globs with Bun `Glob` to find workspace directories.
3. Reads each workspace `package.json` for `name`.
4. Merges `dependsOn` from `bunstart.config.ts` when present.

Supports arbitrary directories (apps, packages, libs, etc.) as defined in `workspaces`. Bun requires the `workspaces` field for monorepos.

## Two entry points

### Via `buns mono <subcommand>`

Routed from `index.ts` case `'mono'` -> `MonoCommand.execute(args)`.

### Via `buns <alias> <commands...>` (direct run)

Routed from `index.ts` default case. When the first arg is not a known CLI command (`init`, `mono`, `--help`, etc.), the entrypoint uses `ResolveWorkspacesPort` to resolve workspaces from `package.json` and checks if the first arg is a workspace alias. If yes, it delegates to mono's `RunInWorkspaceUseCase` and `EnsureDepsBuiltUseCase` (exposed via `MonoCommandFactory`).

## Commands table

| # | Command | Via | Status | Description |
|---|---------|-----|--------|-------------|
| 1 | `mono <alias> <script\|cmd> [args...]` | `buns mono app-example test` | Done | Execute any script or bun command in a workspace. Scripts get `run`; native bun commands (add, remove, etc.) do not. Alias must not collide with reserved names. |
| 2 | `mono start <alias>` | `buns mono start app-example` | Done | Run start script (like build/dev but with `start`). |
| 3 | `mono <alias> add \| a <pkg>` | `buns mono app-example add lodash` | Done | Native bun commands (add, a, install, remove, r, rm, x, link, etc.) in a workspace, without prepending `run`. |
| 4 | `mono remove app\|pkg <name>` | `buns mono remove app my-app` | Done | Remove app/package from config (entry in bunstart.config only). |
| 5 | `bun install` after generate | `buns mono gen app my-app` | Done | Runs `bun install` at repo root after generating a new workspace. |
| 6 | Distinguish `run` vs native commands | both entry points | Done | NativeBunCommands set; no `run` prefix for add, a, install, remove, rm, r, x, link, unlink, pm, outdated, update, create. |
| 7 | `generate app\|pkg <name>` (alias: `gen`) | `buns mono gen app x` | Done | Registers in config + scaffolds directory. |
| 8 | `build <alias>` | `buns mono build app-example` | Done | Builds workspace and dependsOn in topological order. |
| 9 | `dev <alias>` | `buns mono dev app-example` | Done | Runs dev script (builds deps first). |
| 10 | `sync` | `buns mono sync` | Done | Syncs dependsOn from package.json for all workspaces (resolved from package.json `workspaces`). |
| 11 | `mono <alias> add-dep \| a-dep <source> [flags]` | `buns mono exp add-dep pkg-example --dev` | Done | Add a workspace as dependency of the given alias (target). Runs `bun add <pkg>@workspace:*` in target, then syncs config. Flags: --dev, --peer, --optional, --exact. |
| 12 | `mono <alias> remove-dep \| rm-dep \| r-dep <source>` | `buns mono exp remove-dep pkg-example` | Done | Remove a workspace dependency from the given alias. Runs `bun remove <pkg>` in target, then syncs config. |
| 13 | `mono adopt app\|pkg <name>` | `buns mono adopt app client` | Done | Adopt a project already in `apps/<name>` or `packages/<name>`: set package.json name to @scope/name, register in config, run bun install. |
| 14 | `mono adopt app\|pkg <name> [--from <path>]` | `buns mono adopt app my-app --from ../standalone` | Done | Adopt from external path: copy directory to apps/ or packages/, then same as in-place adopt. Path can be `--from <path>` or positional third arg. Destination must not exist. |

## Workspace dependency commands (add-dep, remove-dep)

These commands follow the same pattern as native `bun add` / `bun remove`: the **target** workspace is the alias, the **source** is the workspace to add or remove as a dependency.

- **Add:** `buns mono <alias> add-dep <source> [--dev|--peer|--optional|--exact]` or `buns mono <alias> a-dep <source> [...]`
- **Remove:** `buns mono <alias> remove-dep <source>` or `rm-dep` / `r-dep`

Example: `buns mono exp add-dep pkg-example --dev` adds `@test/pkg-example` to `exp`'s devDependencies and updates `bunstart.config.ts` dependsOn. Sync includes dependencies, devDependencies, peerDependencies, and optionalDependencies.

## Adopt (in-place and from path)

**In-place:** `buns mono adopt app <name>` or `buns mono adopt pkg <name>` — the project must already exist under `apps/<name>` or `packages/<name>` with a valid `package.json`. The use case updates its `name` to `@<scope>/<name>`, adds an entry to `bunstart.config.ts` (AddApp/AddPackage), and runs `bun install` at the repo root.

**From external path:** `buns mono adopt app <name> [--from <path>]` or with a positional path: `buns mono adopt app <name> <path>`. The source path must exist and contain a `package.json`. The directory is **copied** (not moved) to `apps/<name>` or `packages/<name>`. If the destination already exists, the command fails with a clear error. Then the same in-place flow applies (patch name, register in config, bun install). Depends on init's `FilesystemPort` (`existsDir`, `copyDirectory`, `ensureDir`).

## Reserved names

Workspace aliases (app or package names) must NOT collide with these reserved names. Enforced in `mono/domain/services/ReservedNames.ts` (single source of truth). Used so that `buns mono <alias> <cmd>` can tell subcommands from workspace names.

**Mono subcommands and dep commands:**
`generate`, `gen`, `build`, `dev`, `start`, `sync`, `remove`, `adopt`, `add-dep`, `a-dep`, `remove-dep`, `rm-dep`, `r-dep`, `add`, `a`, `install`, `rm`, `r`

**Global CLI:**
`init`, `mono`

**Other bun-like:**
`pm`, `x`, `create`, `link`, `unlink`, `outdated`, `update`, `run`

**Flags:**
`help`, `--help`, `-h`, `--version`, `-v`

Full set in code: `ReservedNames.ts`.

## Scripts vs native bun commands

When running commands in a workspace (`mono <alias> <cmd> [args...]`), the CLI distinguishes:

- **Scripts** (package.json `scripts`): e.g. `build`, `dev`, `start`, `test`. Executed as `bun run <script>`.
- **Native bun commands:** Executed as `bun <command>` (no `run`). Set in `NativeBunCommands.ts`: `add`, `a`, `install`, `remove`, `rm`, `r`, `x`, `link`, `unlink`, `pm`, `outdated`, `update`, `create`.

Custom dep commands (`add-dep`, `a-dep`, `remove-dep`, `rm-dep`, `r-dep`) are handled in MonoCommand before the native/script branch; they are not passed to bun.

## Flow: `mono <alias> <cmd> [args...]` (current)

Example: `buns mono app-example test`

1. MonoCommand.execute receives args `['app-example', 'test']`.
2. `app-example` is not a top-level subcommand (generate, build, dev, start, sync, remove).
3. Fallthrough: treat first arg as alias. `resolveWorkspaces.resolve(cwd)` returns workspaces from package.json; check if `app-example` is in workspaces.
4. If yes: `handleRunInWorkspace('app-example', ['test'])`. `test` is not add-dep/remove-dep/build/dev/start, not native -> `['run', 'test']`. RunInWorkspaceUseCase runs `bun run test` in workspace dir (path from ResolvedWorkspace).
5. If no: error "Unknown subcommand or workspace".

Example: `buns mono app-example add lodash`

1. Same routing; `handleRunInWorkspace('app-example', ['add', 'lodash'])`.
2. `add` is in NativeBunCommands -> `bunArgs = ['add', 'lodash']` (no `run`).
3. RunInWorkspaceUseCase runs `bun add lodash` in the workspace dir (e.g. `apps/app-example/`).

Example: `buns mono exp add-dep pkg-example --dev`

1. Fallthrough with alias `exp`, extraArgs `['add-dep', 'pkg-example', '--dev']`.
2. handleRunInWorkspace(exp, ['add-dep', 'pkg-example', '--dev']): cmd is `add-dep` -> handleAddDep([exp, 'pkg-example', '--dev']).
3. AddWorkspaceDepUseCase: resolve workspaces via ResolveWorkspacesPort; get package name and workspace path for exp; run `bun add --dev @scope/pkg-example@workspace:*` in exp's dir; then SyncDependsOn for exp.

## Flow: `buns <alias> <commands...>` (direct run, current)

Example: `buns app-example build`

1. `index.ts` default case: `command = 'app-example'`, `commandArgs = ['build']`.
2. Resolves workspaces via `ResolveWorkspacesPort`; checks `workspaces.some(w => w.id === command)` -> true.
3. `build` triggers EnsureDepsBuilt first.
4. Prepends `run` -> `['run', 'build']`.
5. `RunInWorkspaceUseCase.execute(cwd, 'app-example', ['run', 'build'])`.
6. Adapter runs `bun run build` in the workspace dir (from ResolvedWorkspace path).

## Flow: `mono adopt app my-app` (in-place)

1. handleAdopt: type=app, name=my-app, no sourcePath.
2. AdoptProjectUseCase.execute(cwd, 'app', 'my-app'): workspacePath = `apps/my-app`. packageJson.read(workspacePath) validates project exists.
3. LoadConfig, getScope(repo), packageName = `@scope/my-app`. packageJson.patch(workspacePath, { name: packageName }). AddAppUseCase.execute(cwd, 'my-app', packageName, []). runBunInstall.execute(cwd).

## Flow: `mono adopt app my-app --from ../standalone`

1. handleAdopt: type=app, name=my-app, sourcePath='../standalone' (parsed from --from or positional).
2. AdoptProjectUseCase: sourceAbsolute = resolve relative to cwd. packageJson.read(sourceAbsolute) validates source. filesystem.existsDir(workspacePath) must be false. ensureDir(join(cwd, 'apps')), copyDirectory(sourceAbsolute, workspacePath).
3. Same as in-place: loadConfig, getScope, patch name, AddApp, runBunInstall.

## Flow: `mono sync`

1. `handleSync()`: resolves workspaces via ResolveWorkspacesPort.
2. If no workspaces, error. Else, for each workspace: SyncDependsOn.execute(cwd, w.id).
3. SyncDependsOn reads workspace package.json, infers dependsOn from deps that match other workspaces, patches bunstart.config.

## Flow: `mono generate app my-app`

1. Loads config via LoadConfigUseCase, derives repo section.
2. Derives scope from existing workspace names (WorkspaceResolver.getScope).
3. Validates `my-app` is not a reserved name.
4. Calls AddAppUseCase (loadConfig + patchConfig) -> updates `.repo` section.
5. Calls scaffolder.scaffoldApp(cwd, 'my-app', 'myorg') -> creates `apps/my-app/`.
6. Runs `bun install` at repo root (RunBunInstallPort) to resolve the new workspace.

## Flow: `mono build app-example`

1. Resolves workspaces via ResolveWorkspacesPort.
2. **EnsureConfigSyncedUseCase.execute(cwd)** — resolves workspaces; if no `.bunstart/sync-state.json` or any workspace `package.json` has mtime greater than lastSyncTime, runs sync for all workspaces (same as `mono sync`) and writes state. SyncState uses workspace paths (e.g. `apps/app-example`, `packages/pkg-example`). Keeps bunstart.config.ts dependsOn in sync without requiring the user to run `mono sync` manually.
3. EnsureDepsBuiltUseCase.execute(cwd, 'app-example') -> BuildOrderResolver (from ResolvedWorkspace[]), then BunBuildWorkspaceAdapter per dependency (path from workspacePath).
4. RunInWorkspaceUseCase.execute(cwd, 'app-example', ['run', 'build']).

## What is done

- Full domain in mono (RepoConfig, AppEntry, PackageEntry, ResolvedWorkspace, WorkspaceResolver, BuildOrderResolver, ReservedNames, NativeBunCommands).
- **ResolveWorkspacesPort** + PackageJsonWorkspacesAdapter: resolves workspaces from package.json `workspaces` field; merges dependsOn from bunstart.config; supports arbitrary dirs (apps, packages, libs, etc.).
- Use cases use ResolveWorkspacesPort for workspace list and paths; config-state (LoadConfig, PatchConfig) for persistence of `.repo` section (dependsOn).
- SyncState uses workspace paths (string[]) instead of apps/packages ids.
- generate/gen, build, dev, start, sync, adopt app|pkg (in-place and --from path), remove app|pkg subcommands.
- **mono &lt;alias&gt; &lt;cmd&gt; [args]:** Fallthrough resolves workspaces; treats first arg as workspace alias; handleRunInWorkspace dispatches to add-dep/a-dep, remove-dep/rm-dep/r-dep, build/dev/start, or native bun commands (add, a, remove, r, rm, etc.) vs run script.
- AddWorkspaceDep and RemoveWorkspaceDep use ResolveWorkspacesPort; add/remove workspace as dependency (bun add/remove in target dir + sync dependsOn). Invoked as `mono <alias> add-dep|a-dep <source> [flags]` and `mono <alias> remove-dep|rm-dep|r-dep <source>`.
- SyncDependsOn uses ResolveWorkspacesPort for path and nameToId; reads dependencies, devDependencies, peerDependencies, optionalDependencies from package.json to infer dependsOn; writes to repo.apps/repo.packages (dir===apps -> apps, else packages).
- `mono` with no args: showUsage lists workspaces from package.json.
- Native bun command set (add, a, install, remove, rm, r, x, link, unlink, pm, outdated, update, create); no `run` prefix for these.
- Reserved names (including adopt, add-dep, a-dep, remove-dep, rm-dep, a, r, rm) in ReservedNames.ts.
- Adopt in-place (project already in apps/ or packages/) and adopt from path (copy from external dir; --from or positional path); AdoptProjectUseCase uses PackageJsonPort and FilesystemPort (existsDir, copyDirectory).
- MonoCommandFactory wires all use cases; exposes createEnsureDepsBuiltUseCase(), createRunInWorkspaceUseCase(), createEnsureConfigSyncedUseCase(), createResolveWorkspacesAdapter() for index.ts run routing.
- Before build/dev/start, EnsureConfigSyncedUseCase runs when needed (SyncState + workspace paths) so bunstart.config.ts dependsOn stay in sync without manual `mono sync`.
- Direct run via `buns <alias> <commands>` uses ResolveWorkspacesPort to validate alias; works with package.json workspaces only (no bunstart.config required for run).
- bun install at repo root after generate (runBunInstall).

## What is missing / TODO

- **Reserved name validation on generate:** Ensure AddAppUseCase / AddPackageUseCase (or MonoCommand handleGenerate) reject workspace names that are in ReservedNames, so no one can create a workspace named e.g. `add-dep` or `build`.
- **Tests:** Unit tests for MonoCommand, use cases (AddWorkspaceDep, RemoveWorkspaceDep, SyncDependsOn, etc.), and domain services.
