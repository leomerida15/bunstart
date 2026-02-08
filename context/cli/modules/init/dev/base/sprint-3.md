# Sprint 3: Template frontend-react (React + Tailwind + reglas bunstart)

**Goal:** Completar el flujo `buns init` → Frontend React: ejecutar `bun init --react=tailwind`, aplicar reglas bunstart adaptadas a React (entry en src/, build/watch), instalar dependencias.

**Status:** Not started

## Scope

- Tipo **frontend-react** = template de Bun con React y Tailwind CSS (`bun init --react=tailwind`) + aplicación de reglas bunstart.
- Reglas bunstart para React: entry puede ser `src/index.tsx`; bunstart.build.ts debe usar entrypoint `src/index.tsx` (o el que genere Bun); scripts build/watch/dev/start coherentes.

## Tasks

| # | Task | Status | Files |
|---|------|--------|-------|
| 1 | Extend BunRuntimePort — añadir `initReactTailwind(cwd: string): Promise<void>` que ejecute `bun init --react=tailwind` (o equivalente) en cwd | pending | modify |
| 2 | BunRuntimeAdapter — implementar initReactTailwind con spawn `bun init --react=tailwind` (y -y si Bun lo requiere para no interactivo) | pending | modify |
| 3 | ApplyBunstartRules — soportar entryExt 'tsx' y entrypoint src/index.tsx en bunstart.build.template para React (Sprint 1 debe permitir options.entryExt; si no, extender en este sprint) | pending | modify/new |
| 4 | Create `init/app/use-cases/BootstrapFrontendReactUseCase.ts` — initReactTailwind(cwd), ApplyBunstartRules.execute(cwd, { entryExt: 'tsx' }), installDependencies(cwd) | pending | new |
| 5 | InitCommand — cuando selectedTemplate.type === 'frontend-react', llamar BootstrapFrontendReactUseCase.execute(cwd) | pending | modify |
| 6 | InitCommandFactory — instanciar BootstrapFrontendReactUseCase e inyectar en InitCommand | pending | modify |
| 7 | Verificar estructura que genera `bun init --react=tailwind` — confirmar si crea index.tsx en raíz o en src/; adaptar ApplyBunstartRules para no romper estructura existente (p. ej. mover a src/ si está en raíz) | pending | verify |
| 8 | Build and verify — `buns init`, elegir Frontend React, comprobar proyecto ejecutable con build/watch | pending | verify |

## Acceptance criteria

- Usuario ejecuta `buns init`, elige "Frontend React"; se ejecuta `bun init --react=tailwind`, se aplican reglas bunstart (src/index.tsx, scripts, bunstart.build.ts con entry tsx), `bun install`.
- El proyecto resultante compila y puede ejecutarse en dev (watch) o build + start.
- 0 lint errors. Build succeeds.

## Notes

- Si `bun init --react=tailwind` ya crea una estructura con src/ y Vite u otro bundler, las reglas bunstart deben integrarse sin sustituir la config de Vite: añadir scripts y bunstart.build.ts/watch que convivan con el resto, o documentar que bunstart es el estándar y adaptar el template de Bun a nuestro build.
- Dependencia de Sprint 1 (ApplyBunstartRules con soporte tsx).
