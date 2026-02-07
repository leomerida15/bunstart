# config-state: What it is and what logic it must have

## What it is

config-state is the module that owns `bunstart.config.ts`, the central configuration file of the bunstart CLI framework. It is the **only** module that reads from and writes to this file. All other modules that need configuration go through config-state.

It is **not** a monorepo module. It does not know what apps, packages, workspaces, or dependsOn are. It only knows that there is a TypeScript config file with sections, and it provides generic operations to load, create, and update those sections.

Think of it as a key-value store for configuration, where each key is a section name (`repo`, `build`, `watch`, etc.) and each value is an arbitrary object owned by another module.

## What it must do

### 1. Load the full config

Read `bunstart.config.ts` from the monorepo root via dynamic `import()` (Bun natively supports importing TS). Return the full config object or null if the file does not exist.

The load must be resilient:
- Missing file -> return null (not an error; the user may not have initialized yet).
- Malformed or unreadable file -> return null (or throw with a clear message).
- Empty export -> return null.

### 2. Create a new config (initialize)

Write a fresh `bunstart.config.ts` from a complete `BunstartConfig` object. Used once when `buns init` bootstraps a new monorepo. Overwrites any existing file.

### 3. Patch (partial update) the config

This is the most important operation. Modules need to update **their section** without touching other sections. The flow:

1. Load current config (or start from `{}` if missing).
2. Deep-merge the incoming partial into the current config.
3. Save the merged result.

Example: mono wants to add a new app to `.repo.apps`. It calls:
```ts
await patchConfig.execute(cwd, {
  repo: {
    apps: { 'my-app': { name: '@scope/my-app', dependsOn: [] } },
    packages: existingPackages // or omit if merge is additive
  }
});
```

The merge strategy must be:
- **Section-level replace**: if a section key is provided, it replaces that entire section. This keeps it simple and predictable. Modules are responsible for loading the current section, making their changes, and passing the complete section back.
- This avoids complex deep-merge edge cases (arrays, nested objects, deletions).

### 4. Serialize to TypeScript source

The saved file must be valid TypeScript that can be imported again. The serialization:
- Produces `const bunstartConfig = { ... };\nexport default bunstartConfig;\n`.
- Uses single quotes for string values.
- Formats with 4-space indentation.
- Handles special characters in keys and values (escaping quotes).

## What logic it must NOT have

config-state must **not** contain:

- Monorepo concepts: apps, packages, workspaces, dependsOn, build order, scope resolution.
- Build logic: running bun commands, spawning processes.
- Scaffold logic: creating directories, copying templates.
- User interface: prompts, selections, messages.
- Any domain logic that belongs to a specific module.

If you find yourself adding a method like `addApp()` or `resolveWorkspace()` to config-state, it belongs in `mono` instead.

## The BunstartConfig type

```ts
/**
 * Root configuration type for bunstart.config.ts.
 * Each top-level property is a section owned by a specific module.
 * config-state treats sections as opaque objects; it does not validate their content.
 */
interface BunstartConfig {
  repo?: RepoSection;
  // Future sections (not implemented yet):
  // build?: BuildSection;
  // watch?: WatchSection;
  // cli?: CliSection;
}
```

The `RepoSection` type is defined here for reference but is **owned by the mono module**. config-state only needs the top-level `BunstartConfig` interface to know which section keys exist. It does not inspect or validate the contents of any section.

```ts
/**
 * Defined here for type completeness; logic lives in mono module.
 */
interface RepoSection {
  apps: Record<string, { name: string; dependsOn: string[] }>;
  packages: Record<string, { name: string; dependsOn: string[] }>;
}
```

## Ports

config-state has a single port:

```ts
interface ConfigStoragePort {
  /**
   * Loads the full config from the given directory.
   * Returns null if no config file exists or if it cannot be read.
   */
  load(cwd: string): Promise<BunstartConfig | null>;

  /**
   * Saves the full config to the given directory.
   * Creates or overwrites the config file.
   */
  save(cwd: string, config: BunstartConfig): Promise<void>;
}
```

There is only one adapter: `BunstartConfigFileAdapter`, which reads via `import()` and writes by serializing to TypeScript source.

## Use cases

### LoadConfigUseCase

```ts
class LoadConfigUseCase {
  constructor(private storage: ConfigStoragePort) {}
  async execute(cwd: string): Promise<BunstartConfig | null> {
    return this.storage.load(cwd);
  }
}
```

Thin wrapper. Exists so consumers depend on a use case (application layer) rather than the port directly.

### InitializeConfigUseCase

```ts
class InitializeConfigUseCase {
  constructor(private storage: ConfigStoragePort) {}
  async execute(cwd: string, config: BunstartConfig): Promise<void> {
    await this.storage.save(cwd, config);
  }
}
```

Writes a complete config. Used once during `buns init`.

### PatchConfigUseCase

```ts
class PatchConfigUseCase {
  constructor(private storage: ConfigStoragePort) {}
  async execute(cwd: string, partial: Partial<BunstartConfig>): Promise<void> {
    const current = await this.storage.load(cwd) ?? {};
    const merged = { ...current, ...partial };
    await this.storage.save(cwd, merged);
  }
}
```

Section-level merge: replaces sections that are provided, keeps sections that are not. Modules must pass the complete section they own (not a partial of a section).

## How other modules use it

### mono module (manages `.repo` section)

```ts
// Reading repo config
const config = await loadConfig.execute(cwd);
const repo = config?.repo ?? { apps: {}, packages: {} };

// Adding an app
repo.apps['my-app'] = { name: '@scope/my-app', dependsOn: [] };
await patchConfig.execute(cwd, { repo });

// The mono module owns ALL logic about what goes into repo.apps and repo.packages.
// config-state just stores and retrieves it.
```

### init module (creates initial config)

```ts
const initialConfig: BunstartConfig = {
  repo: {
    apps: { 'app-example': { name: '@scope/app-example', dependsOn: ['pkg-example'] } },
    packages: { 'pkg-example': { name: '@scope/pkg-example', dependsOn: [] } }
  }
};
await initializeConfig.execute(cwd, initialConfig);
```

### Future module example (hypothetical build config)

```ts
// A future build-config module would:
const config = await loadConfig.execute(cwd);
const build = config?.build ?? { sourcemap: 'none', minify: false };
build.minify = true;
await patchConfig.execute(cwd, { build });
```

## Design principles

1. **Single responsibility**: config-state only does file I/O for `bunstart.config.ts`. No domain logic.
2. **Open for extension**: New config sections can be added by extending the `BunstartConfig` interface. No changes to use cases or adapters needed.
3. **Opaque sections**: config-state does not validate section contents. Each module is responsible for validating its own section.
4. **Immutable reads**: `LoadConfigUseCase` returns a snapshot. Mutations happen via `PatchConfigUseCase`.
5. **No side effects**: Loading config does not trigger any actions. Patching config does not trigger rebuilds or installs. Those are the responsibility of the calling module.
