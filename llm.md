# Bunstart Project Documentation (AI-Ready)

## Overview
Bunstart is a comprehensive ecosystem for managing Bun.js projects. It provides a CLI (`buns`) that handles monorepos, automated builds, and scaffolding with a strict adherence to Clean Architecture.

---

## Technical Identity & Standards

### Architecture: Hexagonal (Ports & Adapters)
- **Domain**: Core business logic and entities (e.g., `Workspace`, `Command`). No external dependencies.
- **Application**: Use Cases that orchestrate domain logic (e.g., `BuildWorkspace`, `SyncDependencies`).
- **Infrastructure**: Concrete implementations (Adapters) for Filesystem, Bun CLI, and process management.

### Build System: @bunstart/pack
- **Native Bun**: Uses `Bun.build`, `Bun.serve`, and `Bun.watch` natively via the `@bunstart/pack` library.
- **DTS Optimization**: Uses `isolatedDeclarations` for ultra-fast type generation.
- **Smart Watch**: CLI uses a reverse dependency graph for incremental rebuilds.
- **Asset Management**: Automatic hash injection in HTML and public asset management for production builds.

---

## CLI & Monorepo Orchestration

### Core Commands
- `buns init`: Bootstraps a new project from standard templates (`monorepo`, `api-rest`, `frontend-react`, `library`).
- `buns create [app]`: Wraps `bun create` or runs interactively to generate apps, applying Bunstart standards.
- `buns mono generate <app|pkg> <name> [--template <template>]`: Adds new members to the monorepo workspaces and optionally applies a specific template (or asks via interactive prompt). Alias: `gen`.
- `buns mono create [name]`: Scaffolds a new monorepo in a nested directory.
- `buns mono migrate`: Migrates an existing monorepo to the Bunstart layout.
- `buns mono sync`: Hydrates the internal dependency graph based on `package.json`'s `dependsOn` config.

### Magic Execution (Workspace Aliasing)
If a command is not found in the core CLI, Bunstart attempts to resolve it as a **Workspace Alias**:
**Example**: `buns doc build`
1. Resolves `doc` to the workspace directory.
2. Sincronizes the global state (`bunstart.config.ts`).
3. Automatically builds all internal dependencies.
4. Executes the `build` script in the target workspace.

Wait, `buns mono <alias> add-dep` vs `buns <alias> add`:
- **For External Dependencies or Scripts**: Use `buns <alias> add <dep>` to add an external npm/bun package, or `buns <alias> <script>` to run an npm script (e.g., `buns <alias> test`).
- **For Internal Dependencies**: **You MUST use `buns mono <alias> add-dep <source> [--dev|--peer|--optional|--exact]`** (or aliases `a-dep`, `rm-dep`, `r-dep`). You cannot use `buns <alias> add-dep` because `add-dep` is an internal monorepo CLI command, not a native Bun CLI command or npm script!

---

## AI Agent Guidelines (Operational Context)

If you are an AI assisting in this project, follow these directives:

### 1. Context Discovery
- Before making changes, read the `context/` directory. It contains domain-specific knowledge items (**KIs**) and persistent logs.
- The `llm.md` file (this file) serves as your primary architectural compass.

### 2. Implementation Flow
- **Adding a Command**: Implement a Use Case in the Application layer, a Port in the Domain, and a Factory for the CLI entry point.
- **Modifying Build Logic**: Edit the `bunstart.build.ts` located in the root of each workspace.
- **Dependencies**: Use `buns <alias> add <dep>` to add external packages or `buns mono <alias> add-dep <source>` for internal monorepo dependencies.
- **Documentation**: When making large architecture changes, update `README.md`, `apps/cli/README.md`, and `llm.md` to reflect the latest CLI features.

### 3. Verification
- Always run `buns <alias> build` after modifying a package to ensure TypeScript integrity and updated builds.
- Use `packages/cli` as the source of truth for all monorepo management logic.

### 4. Code Generation
- Ensure all generated code includes JSDoc blocks.
- Prefer `Bun.file` and `Bun.write` over Node.js `fs` where performance and simplicity are required.
- Maintain the Hexagonal structure: never import Infrastructure adapters directly into the Domain.

---

## Continuous Context Persistence
Business logic and long-term architectural decisions are stored in:
- `context/`: For human-readable logic and system documentation.
- `.agent/workflows`: For agent-specific memory and workflow persistence (e.g., `cuestiom.md`, `plan.md`).
