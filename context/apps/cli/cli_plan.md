# CLI Plan - bunstart

This document outlines the development plan for the `bunstart` CLI tool.

## Init Command Development Plan

The `init` command is designed to be a superset of `bun init`, providing a user-friendly interface to select from various project templates while maintaining the core functionality of the native bun initializer.

| Index | Name | Description | Status |
|-------|------|-------------|--------|
| 1 | Command Structure | Define the `InitCommand` class and integration with the CLI entry point. | 🟢 Done |
| 2 | Template Selection UI | Implement a single-selection list using `enquirer` to choose the project type. | 🟡 In Progress |
| 3 | Bun Init Integration | Logic to trigger `bun init` for basic project configuration after template selection. | 🔴 Pending |
| 4 | Mono Repo Template | Implementation of the monorepo base structure (packages/apps folders, root configs). | 🔴 Pending |
| 5 | API REST Template | Implementation of a standard API REST template with Bun. | 🔴 Pending |
| 6 | Frontend React Template | Implementation of a React + Vite + Bun template. | 🔴 Pending |
| 7 | Success Feedback | Add premium-looking console output and success messages after initialization. | 🔴 Pending |

## Action Plan: Init Command

1.  **Enhance Selection UI**: Update `packages/cli/src/command/init/init.ts` to include all templates defined in `cli.md`.
2.  **Native Integration**: Use `Bun.spawn` to execute `bun init` passed through to the user.
3.  **Template Scaffolding**: Create a utility to copy template files or generate them dynamically based on the selection.
4.  **Monorepo Support**: Specifically handle the monorepo setup as it's a core feature of `bunstart`.
