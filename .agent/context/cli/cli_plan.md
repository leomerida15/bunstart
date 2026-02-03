# CLI Plan - Bunpack

This document outlines the development plan for the `bunpack` CLI tool.

## Init Command Development Plan

The `init` command is designed to be a superset of `bun init`, providing a user-friendly interface to select from various project templates while maintaining the core functionality of the native bun initializer.

| Index | Name | Description | Status |
|-------|------|-------------|--------|
| 1 | Command Structure | Define the `InitCommand` class and integration with the CLI entry point. | 🟢 Done |
| 2 | Template Selection UI | Implement a single-selection list using `enquirer` to choose the project type. | � Done |
| 3 | Bun Init Integration | Logic to trigger `bun init` for basic project configuration after template selection. | � In Progress |

## Mono Command Development Plan

El comando `mono` permite gestionar un monorepo ya creado, facilitando la ejecución de scripts en paquetes específicos y la generación de nuevos componentes.

| Index | Name | Description | Status |
|-------|------|-------------|--------|
| 1 | Command Structure | Define the `MonoCommand` class and integration with the CLI entry point. | 🟢 Done |
| 2 | Workspace Discovery | Logic to identify applications and packages within the monorepo. | 🔴 Pending |
| 3 | Script Execution | Wrapper for `bun run` to execute scripts in specific workspaces. | 🔴 Pending |
| 4 | App/Package Generation | Scaffolding new apps or packages within the existing monorepo. | 🔴 Pending |
| 5 | Selection Context | Persistence of the "selected" package to simplify repeated commands. | 🔴 Pending |

## Action Plan: CLI Enhancement

1.  **Bun Init Integration**: Implement the `BunSpawnAdapter` to execute native bun commands.
2.  **Mono Command Factory**: Create `MonoCommandFactory` to wire up dependencies for monorepo management.
3.  **Workspace Entity**: Define a `Workspace` domain entity to represent packages/apps.
4.  **Template Scaffolding**: Create a generic utility to handle project/package creation.
