# bunstart

# CLI Module

CLI for project initialization and monorepo management. Invoked as `buns` or `bunstart`.

## Installation

| Method | Command |
|--------|---------|
| **Global (Bun)** | `bun add -g @bunstart/cli` |
| **Global (npm)** | `npm install -g @bunstart/cli` |
| **Run once (no install)** | `bunx @bunstart/cli --help` |

From source (monorepo):

```bash
git clone https://github.com/leomerida15/bunstart.git
cd bunstart && bun install
cd packages/cli && bun run build && bun link
```

After `bun link`, `buns` and `bunstart` are available globally.

---

## General usage

```bash
buns <command> [options]
buns --help
buns --version
```

| Option | Description |
|--------|--------------|
| `-h`, `--help` | Show help |
| `-v`, `--version` | Show version |

---

## Main commands

### `init`

**What it does:** Starts an interactive wizard to initialize a new project with a bunstart template. It sets up the folder structure, scripts, and config for the chosen template.

**When to use it:** Use when you want a new project (or to convert the current directory) following bunstart conventions (e.g. `src/`, `bunstart.build.ts`, `bunstart.watch.ts`).

**Templates:**

| Template | Purpose |
|----------|---------|
| `monorepo` | Multi-package repo with workspaces |
| `api-rest` | Backend API (REST) with Bun |
| `frontend-react` | React app with Tailwind and bunstart build/watch |
| `library` | Reusable TS library |

**Example:**

```bash
buns init
```

---

### `create`

**What it does:** Creates a new project. With no arguments it can run interactively or use an internal flow; with a template name (e.g. `next-app`, `react`) it delegates to `bun create` and then applies bunstart rules (scripts, structure) and optionally adopts the project into a monorepo if you are inside one.

**When to use it:** Use to scaffold a new app or package in one step, with or without adding it to an existing monorepo.

**Syntax:**

```bash
buns create [app] [options]
```

**Arguments:**

| Argument | Description |
|----------|-------------|
| `app` | Bun create template (e.g. `next-app`, `react`) |

**Options:**

| Option | Description |
|--------|-------------|
| `--skip-build` | Do not generate `bunstart.build.ts` or `bunstart.watch.ts` |
| `--yes`, `-y` | Skip prompts and use defaults |
| `--help`, `-h` | Show command help |

**Examples:**

```bash
buns create
buns create next-app
buns create react
buns create next-app --skip-build
buns create next-app -y
buns create --help
```

---

### `mono`

**What it does:** Manages a bunstart monorepo: create/migrate the repo, add/remove apps and packages, run scripts in workspaces, and manage workspace dependencies (`dependsOn`). Must be run from the monorepo root (where `package.json` has `workspaces`).

**When to use it:** Use when you are in the root of a monorepo and want to add apps/packages, run build/dev/start, sync config, or run arbitrary scripts in a workspace by alias.

**Syntax:**

```bash
buns mono <subcommand> [options]
buns mono <alias> <script|cmd> [args...]
```

#### `mono` subcommands (overview)

| Subcommand | What it does |
|------------|--------------|
| `create [name]` | Creates a new directory and runs `buns init` inside it to bootstrap a nested project. |
| `migrate` | Migrates an existing monorepo to bunstart layout and config (workspaces, scripts, dependsOn). |
| `generate app <name>` / `gen app <name>` | Scaffolds a new app, adds it to workspaces and bunstart config. |
| `generate pkg <name>` / `gen pkg <name>` | Scaffolds a new package, adds it to workspaces and bunstart config. |
| `build <alias>` | Runs the `build` script in the workspace identified by `<alias>`. Ensures config and dependencies are synced first. |
| `dev <alias>` | Runs the `dev` script in the workspace (e.g. watch mode). |
| `start <alias>` | Runs the `start` script in the workspace. |
| `sync` | Syncs `dependsOn` from each workspace’s `package.json` into the bunstart config so the dependency graph is up to date. |
| `adopt app <name> [--from <path>]` | Registers an existing app (in current dir or copied from `path`) as a workspace app. |
| `adopt pkg <name> [--from <path>]` | Registers an existing package (in current dir or copied from `path`) as a workspace package. |
| `remove app <name>` | Removes an app from bunstart config and workspace list. |
| `remove pkg <name>` | Removes a package from bunstart config and workspace list. |

**Run a script or command in a workspace by alias:**

| Usage | Description |
|--------|-------------|
| `buns mono <alias> <script>` | Run a npm/bun script (e.g. `test`, `lint`) in that workspace. |
| `buns mono <alias> add <pkg>` | Run `bun add <pkg>` in that workspace. |
| `buns mono <alias> add-dep <source> [--dev\|--peer\|--optional\|--exact]` | Add another workspace as a dependency and sync config. |
| `buns mono <alias> remove-dep <source>` | Remove a workspace dependency and sync config. |

**Examples:**

```bash
buns mono
buns mono create my-monorepo
buns mono migrate
buns mono generate app my-app
buns mono gen pkg shared-utils
buns mono build app-example
buns mono dev app-example
buns mono start app-example
buns mono sync
buns mono adopt app my-app
buns mono adopt pkg utils --from ../utils
buns mono remove app old-app
buns mono remove pkg old-pkg
buns mono app-example build
buns mono app-example dev
buns mono app-example add lodash
buns mono app-example add-dep shared-utils --dev
buns mono app-example remove-dep shared-utils
```

---

## Run by alias (monorepo root)

From the monorepo root you can run commands in a workspace by its alias **without** typing `mono`:

```bash
buns <appAlias|pkgAlias> <script> [args...]
```

**What it does:** Resolves `<appAlias|pkgAlias>` to a workspace, then runs the given script (or command) in that workspace’s directory. For `build`, `dev`, and `start`, the CLI syncs config and builds dependencies first.

**Examples:**

```bash
buns app-example build
buns app-example dev
buns app-example start
buns app-example test
```
