# Bunstart Project Documentation (AI-Ready)

## Overview
Bunstart is a comprehensive ecosystem for managing Bun.js projects. It provides a CLI (`buns`) that handles monorepos, automated builds, and scaffolding with a strict adherence to Clean Architecture.

---

## Technical Identity & Standards

### Architecture: Hexagonal (Ports & Adapters)
- **Domain**: Core business logic and entities (e.g., `Workspace`, `Command`). No external dependencies.
- **Application**: Use Cases that orchestrate domain logic (e.g., `BuildWorkspace`, `SyncDependencies`).
- **Infrastructure**: Concrete implementations (Adapters) for Filesystem, Bun CLI, and process management.

### Development Pillars
- **Clean Code**: High readability, meaningful naming, and single-responsibility functions.
- **Documentation**:
  - **API**: OpenAPI for all REST endpoints.
  - **Code**: Comprehensive JSDoc for all public methods and types.
- **Build System**: Native `Bun.build` integrated into `bunstart.build.ts` (build) and `bunstart.watch.ts` (watch).

---

## CLI & Monorepo Orchestration

### Core Commands
- `buns init`: Bootstraps a new project from templates.
- `buns create <template>`: Wraps community templates with Bunstart standards.
- `buns mono generate <app|pkg> <name>`: Adds new members to the monorepo workspaces.
- `buns mono sync`: Hydrates the internal dependency graph based on `package.json` and local configs.

### Magic Execution (Workspace Aliasing)
If a command is not found in the core CLI, Bunstart attempts to resolve it as a **Workspace Alias**.
**Example**: `buns doc build`
1. Resolves `doc` to the workspace directory.
2. Sincronizes the global state.
3. Automatically builds all internal dependencies.
4. Executes the `build` script in the target workspace.

---

## AI Agent Guidelines (Operational Context)

If you are an AI AI assisting in this project, follow these directives:

### 1. Context Discovery
- Before making changes, read the `context/` directory. It contains domain-specific knowledge items (**KIs**) and persistent logs.
- The `llm.md` file (this file) serves as your primary architectural compass.

### 2. Implementation Flow
- **Adding a Command**: Implement a Use Case in the Application layer, a Port in the Domain, and a Factory for the CLI entry point.
- **Modifying Build Logic**: Edit the `bunstart.build.ts` located in the root of each workspace.
- **Dependencies**: Use `buns <alias> add <dep>` to add external packages or `buns <alias> add-dep <source>` for internal monorepo dependencies.

### 3. Verification
- Always run `buns <alias> build` after modifying a package to ensure TypeScript integrity and updated builds.
- Use the `packages/cli` as the source of truth for all monorepo management logic.

### 4. Code Generation
- Ensure all generated code includes JSDoc blocks.
- Prefer `Bun.file` and `Bun.write` over Node.js `fs` where performance and simplicity are required.
- Maintain the Hexagonal structure: never import Infrastructure adapters directly into the Domain.

---

## Continuous Context Persistence
Business logic and long-term architectural decisions are stored in:
- `context/`: For human-readable logic and system documentation.
- `.agent/`: For agent-specific memory and workflow persistence.
