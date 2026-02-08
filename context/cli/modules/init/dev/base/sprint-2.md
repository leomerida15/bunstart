# Sprint 2: Template api-rest (Blank + reglas bunstart)

**Goal:** Completar el flujo `buns init` → API REST: ejecutar `bun init -y` (Blank), aplicar reglas bunstart, instalar dependencias. Sin bunstart.config en init; el usuario puede usar sync después si está en monorepo.

**Status:** Not started

## Scope

- Tipo **api-rest** = template Blank de Bun + aplicación de reglas bunstart (Sprint 1).
- No crear bunstart.config.ts en el directorio (proyecto single-package; sync puede agregarlo después en monorepo).

## Tasks

| # | Task | Status | Files |
|---|------|--------|-------|
| 1 | Create `init/app/use-cases/BootstrapApiRestUseCase.ts` — depende de BunRuntimePort, ApplyBunstartRulesPort (o UseCase); flujo: initBlank(cwd), ApplyBunstartRules.execute(cwd), installDependencies(cwd) | pending | new |
| 2 | BunRuntimePort — confirmar que initBlank(cwd) ejecuta `bun init -y` en cwd (ya existe en BunRuntimeAdapter) | pending | verify |
| 3 | InitCommand — cuando selectedTemplate.type === 'api-rest', llamar BootstrapApiRestUseCase.execute(cwd) en lugar de "Configuring project..." | pending | modify |
| 4 | InitCommandFactory — instanciar BootstrapApiRestUseCase e inyectarlo en InitCommand (o pasar un mapa template → use case para escalar a más tipos) | pending | modify |
| 5 | (Opcional) UserInterfacePort.askProjectName — prompt para nombre del proyecto; usar como nombre en package.json si se desea; puede diferirse | deferred | - |
| 6 | Build and verify — `buns init`, elegir API REST, comprobar que se crea index.ts → src/index.ts, bunstart.build.ts, bunstart.watch.ts, scripts, bun install | pending | verify |

## Acceptance criteria

- Usuario ejecuta `buns init`, elige "API REST"; se ejecuta `bun init -y`, se aplican reglas bunstart (src/index.ts, build/watch scripts), se ejecuta `bun install`.
- El proyecto resultante tiene package.json con scripts build, watch, dev, start y entry en src/index.ts.
- 0 lint errors. Build succeeds.

## Notes

- BootstrapApiRestUseCase no pide alias (a diferencia del monorepo); es single-package. Si en el futuro se quiere nombre de proyecto, se puede añadir askProjectName.
- Reutilizar ApplyBunstartRules del Sprint 1; si Sprint 1 no está cerrado, este sprint depende de él.
