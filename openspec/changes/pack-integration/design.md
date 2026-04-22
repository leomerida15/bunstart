# Design: pack-integration

## Architecture Decisions

### AD-1: Templates usan pack directamente (no wrapper)

**Decision**: Los templates nuevos usan `buildSetting()` directamente en `bunstart.build.ts`, no un wrapper intermedio.

**Rationale**: El propio `@bunstart/pack` ya usa este patrón en su `bunstart.build.ts`. Es simple, directo y el usuario puede personalizarlo.

**Alternative considered**: Crear un `bunstart.config.ts` con toda la config y que `bunstart.build.ts` lo lea. Rechazado porque agrega complejidad innecesaria para el caso simple.

### AD-2: Adopt siempre usa pack (envoltorio no-destructivo)

**Decision**: El comando `adopt` SIEMPRE aplica pack por defecto. No hay flag `--with-pack`, es el comportamiento estándar.

**Rationale**: 
1. Mantener consistencia: todos los proyectos en el ecosistema bunstart usan pack
2. El flag `--from` es opcional: se puede adoptar proyectos existentes o copiar desde externo
3. Envolver scripts es seguro: los originales siguen funcionando

**Pattern**:
```typescript
// bunstart.config.ts generado por adopt
export default {
  pack: {
    build: { script: 'bun run build' },
    dev: { script: 'bun run dev' },
    start: { script: 'bun run start' }
  },
  repo: { ... }
};
```

**Flujos soportados**:
- `buns mono adopt app my-api` → Adopta proyecto existente en apps/my-api
- `buns mono adopt app my-api --from ../external` → Copia desde externo y adopta

### AD-3: Skill como archivo SKILL.md estático

**Decision**: El Agent Skill es un archivo `SKILL.md` con documentación, no un MCP server.

**Rationale**: 
1. Más simple de implementar y mantener
2. Funciona con cualquier agente (OpenCode, Claude, Cursor, etc.)
3. MCP se puede agregar después como Nivel 3

### AD-4: migrate-pack es comando separado, no auto-detección

**Decision**: `migrate-pack` es un comando explícito, no se ejecuta automáticamente.

**Rationale**: Migrar scripts es una operación destructiva potencial. El usuario debe opt-in explícitamente.

---

## Implementation Tasks

### Phase 1: Templates + Dependency (CLI)

| Task | Files | Description |
|------|-------|-------------|
| 1.1 | `packages/cli/src/utils/template/single-package/bunstart.build.ts.template` | Migrar a buildSetting() |
| 1.2 | `packages/cli/src/utils/template/single-package/bunstart.build.frontend.ts.template` | Migrar a buildSetting() |
| 1.3 | `packages/cli/src/utils/template/monorepo/apps/app-example/bunstart.build.ts.template` | Migrar a buildSetting() |
| 1.4 | `packages/cli/src/utils/template/monorepo/packages/pkg-example/bunstart.build.ts.template` | Migrar a buildSetting() |
| 1.5 | `packages/cli/src/modules/init/infra/adapters/ApplyBunstartRulesAdapter.ts` | Agregar @bunstart/pack como dependency |
| 1.6 | `packages/cli/src/modules/mono/infra/adapters/MonorepoScaffolderAdapter.ts` | Agregar @bunstart/pack en monorepo templates |

### Phase 2: Adopt con pack por defecto (CLI)

| Task | Files | Description |
|------|-------|-------------|
| 2.1 | Nuevo use case | `MigrateToPackUseCase` que envuelve scripts y agrega pack |
| 2.2 | `packages/cli/src/modules/mono/app/use-cases/AdoptProjectUseCase.ts` | Integrar MigrateToPackUseCase (siempre aplica pack) |
| 2.3 | `packages/cli/src/modules/mono/app/MonoCommand.ts` | Hacer --from opcional (no requerido) |

### Phase 3: migrate-pack (CLI)

| Task | Files | Description |
|------|-------|-------------|
| 3.1 | `packages/cli/src/modules/mono/app/MonoCommand.ts` | Agregar subcomando migrate-pack |
| 3.2 | Reutilizar MigrateToPackUseCase | Misma lógica que adopt --with-pack |

### Phase 4: Agent Skill

| Task | Files | Description |
|------|-------|-------------|
| 4.1 | `.opencode/skills/bunstart/SKILL.md` | Crear skill con documentación |
| 4.2 | `.agents/skills/bunstart/SKILL.md` | Copiar para otros agentes |

---

## Sequence Diagram: adopt con pack por defecto

```
User → MonoCommand: buns mono adopt app my-api --from ../external
MonoCommand → AdoptProjectUseCase: execute(cwd, 'app', 'my-api', sourcePath)
AdoptProjectUseCase → FilesystemPort: copyDirectory(sourcePath, workspacePath)
AdoptProjectUseCase → PackageJsonPort: read(workspacePath/package.json)
AdoptProjectUseCase → MigrateToPackUseCase: execute(workspacePath, existingScripts)
MigrateToPackUseCase → PackageJsonPort: patch({ dependencies: { '@bunstart/pack': 'workspace:*' } })
MigrateToPackUseCase → FilesystemPort: writeFile(bunstart.config.ts, packConfig)
AdoptProjectUseCase → AddAppUseCase: execute(cwd, name, packageName, [])
AdoptProjectUseCase → RunBunInstallPort: execute(cwd)
```

```
User → MonoCommand: buns mono adopt app my-api (sin --from)
MonoCommand → AdoptProjectUseCase: execute(cwd, 'app', 'my-api', undefined)
AdoptProjectUseCase → FilesystemPort: verify workspacePath existe
AdoptProjectUseCase → PackageJsonPort: read(workspacePath/package.json)
AdoptProjectUseCase → MigrateToPackUseCase: execute(workspacePath, existingScripts)
MigrateToPackUseCase → PackageJsonPort: patch({ dependencies: { '@bunstart/pack': 'workspace:*' } })
MigrateToPackUseCase → FilesystemPort: writeFile(bunstart.config.ts, packConfig)
AdoptProjectUseCase → AddAppUseCase: execute(cwd, name, packageName, [])
AdoptProjectUseCase → RunBunInstallPort: execute(cwd)
```

---

## bunstart.config.ts Schema (pack section)

```typescript
interface BunstartConfig {
  pack?: {
    build?: PackScriptConfig;
    dev?: PackScriptConfig;
    start?: PackScriptConfig;
  };
  repo: RepoConfig;
}

interface PackScriptConfig {
  // Modo wrapper: ejecuta el script original
  script?: string;
  
  // Modo nativo: config directa de pack (agente AI puede migrar esto)
  entry?: string;
  outdir?: string;
  target?: 'bun' | 'node' | 'browser';
  format?: 'esm' | 'cjs' | 'iife';
  minify?: boolean;
  sourcemap?: boolean;
  plugins?: string[];
  external?: string[];
}
```
