---
name: bunstart-rules
description: Coding standards and architecture rules for bunstart projects - Clean Code, SOLID, Hexagonal Architecture, TypeScript conventions
---

# Skill: bunstart-rules

Use this skill when writing or refactoring code in a bunstart project. These rules are automatically enforced for all code generation.

## When to Use

- Writing new code (functions, classes, modules)
- Refactoring existing code
- Creating new packages or apps in a bunstart monorepo
- Configuring TypeScript or build settings
- Defining module structure

---

## 1. Clean Code Principles

- **Meaningful Names**: Use descriptive, unambiguous names. Avoid abbreviations.
- **Small Functions**: Do one thing and do it well. Keep functions short.
- **DRY**: Extract common logic into reusable functions/components.
- **Error Handling**: Handle errors gracefully. No silent failures.

---

## 2. SOLID Principles

- **SRP**: Single Responsibility - one reason to change
- **OCP**: Open for extension, closed for modification
- **LSP**: Subtypes substitutable for base types
- **ISP**: Split large interfaces into smaller, specific ones
- **DIP**: High-level modules depend on abstractions, not concretions

---

## 3. Hexagonal Architecture (Ports & Adapters)

- **Domain Centric**: Core business logic independent of frameworks, DB, or UI
- **Dependency Rule**: Dependencies point INWARDS toward Domain
- **Ports**: Define interfaces in Domain/Application that Infrastructure implements

### Module Structure

```
src/modules/<module-name>/
  domain/       # Entities, Value Objects (no external deps)
  app/         # Use Cases, Ports (depends on Domain)
  infra/       # Adapters, Repositories (depends on Domain/App)
  index.ts     # Public API
```

---

## 4. TypeScript Conventions

- **No .js extensions** in imports
- **Type-only imports** use `type` keyword:
  ```typescript
  import type { MyInterface } from "./path";
  import { MyClass, type MyType } from "./path";
  ```
- **Destructured Constructor Props**:
  ```typescript
  interface MyClassProps {
    dependency: SomeDependency;
    config: SomeConfig;
  }

  export class MyClass {
    constructor({ dependency, config }: MyClassProps) {
      // ...
    }
  }
  ```

---

## 5. Workspace Structure

- `packages/` — Reusable libraries
- `apps/` — End-user applications (CLI, etc.)
- `src/modules/` — Vertical slices with internal hexagonal structure

Each module must have its own Domain/App/Infra layers.

---

## 6. TypeScript Alias Paths

- Each package/app MUST have a corresponding alias defined in `tsconfig.json`
- **Use aliases** instead of relative paths:
  ```typescript
  // Good
  import { Something } from "@my-package/domain";

  // Avoid
  import { Something } from "../../domain";
  ```

---

## 7. Documentation

- **REST APIs**: Use OpenAPI spec
- **JSDoc**: Document all public methods, classes, interfaces with JSDoc comments

---

## Trigger

This skill has `trigger: always_on` meaning it's automatically applied to all code generation in bunstart projects.

## Related Files

- Project rules: `.opencode/rules/code.md`
- Architecture: `.opencode/rules/arquitecture.md`  
- Workspace: `.opencode/rules/workspace.md`