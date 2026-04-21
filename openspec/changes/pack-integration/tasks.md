# Tasks: pack-integration

## Phase 1: Templates + Dependency

### 1.1 Migrar template backend (single-package)
- [x] Actualizar `packages/cli/src/utils/template/single-package/bunstart.build.ts.template`
  - Reemplazar `Bun.build()` + `tsc` spawn con `buildSetting()` de `@bunstart/pack`
  - Importar `buildSetting` desde `@bunstart/pack`

### 1.2 Migrar template frontend (single-package)
- [x] Actualizar `packages/cli/src/utils/template/single-package/bunstart.build.frontend.ts.template`
  - Reemplazar con `buildSetting()` incluyendo plugins de frontend

### 1.3 Migrar template app (monorepo)
- [x] Actualizar `packages/cli/src/utils/template/monorepo/apps/app-example/bunstart.build.ts.template`
  - Reemplazar `Bun.build()` + `tsc` spawn con `buildSetting()`

### 1.4 Migrar template pkg (monorepo)
- [x] Actualizar `packages/cli/src/utils/template/monorepo/packages/pkg-example/bunstart.build.ts.template`
  - Reemplazar con `buildSetting()` + DTS habilitado

### 1.5 Agregar @bunstart/pack como dependency en ApplyBunstartRulesAdapter
- [x] Modificar `packages/cli/src/modules/init/infra/adapters/ApplyBunstartRulesAdapter.ts`
  - En `patchPackageJson()`, agregar `@bunstart/pack` como dependency
  - Para monorepo: `"@bunstart/pack": "workspace:*"`
  - Para standalone: `"@bunstart/pack": "^0.0.1"`

### 1.6 Agregar @bunstart/pack en monorepo scaffolder
- [x] Verificar si `MonorepoScaffolderAdapter` genera package.json con dependencies
  - Agregar `@bunstart/pack` como dependency en los templates de app/pkg

---

## Phase 2: Adopt con pack por defecto

### 2.1 Crear MigrateToPackUseCase
- [ ] Crear `packages/cli/src/modules/mono/app/use-cases/MigrateToPackUseCase.ts`
  - Input: `workspacePath`, `existingScripts`
  - Output: void
  - Comportamiento:
    1. Leer package.json del workspace
    2. Agregar `@bunstart/pack` como dependency
    3. Crear/actualizar `bunstart.config.ts` con sección `pack`
    4. Los scripts originales se envuelven en pack.script

### 2.2 Modificar AdoptProjectUseCase (SIEMPRE aplica pack)
- [ ] Modificar `packages/cli/src/modules/mono/app/use-cases/AdoptProjectUseCase.ts`
  - Siempre llamar `MigrateToPackUseCase` después de copiar/registrar
  - No hay flag `withPack`, es el comportamiento por defecto

### 2.3 Modificar MonoCommand (--from es opcional)
- [ ] Modificar `packages/cli/src/modules/mono/app/MonoCommand.ts`
  - En `handleAdopt()`, hacer que `--from` sea OPCIONAL
  - Si no hay `--from`, verificar que el workspace ya existe en apps/ o packages/
  - Actualizar `printAdoptUsage()` para mostrar uso correcto

---

## Phase 3: migrate-pack

### 3.1 Agregar subcomando migrate-pack
- [ ] Modificar `packages/cli/src/modules/mono/app/MonoCommand.ts`
  - Agregar handler para `subcommand === 'migrate-pack'`
  - Reutilizar `MigrateToPackUseCase`

---

## Phase 4: Agent Skill

### 4.1 Crear skill bunstart
- [ ] Crear `.opencode/skills/bunstart/SKILL.md`
  - Secciones:
    1. When to Use (triggers)
    2. Critical Patterns (comandos CLI, buildSetting API)
    3. Code Examples (por tipo de proyecto)
    4. Commands Reference
    5. Troubleshooting

### 4.2 Copiar skill para otros agentes
- [ ] Copiar a `.agents/skills/bunstart/SKILL.md`
  - Mismo contenido, disponibilidad multi-agente

---

## Dependencies

- **@bunstart/pack debe estar publicado** (al menos en workspace) antes de Phase 1
- **Phase 2 depende de Phase 1** (MigrateToPackUseCase necesita que pack sea installable)
- **Phase 3 depende de Phase 2** (reutiliza MigrateToPackUseCase)
- **Phase 4 es independiente** (documentación, no código)
