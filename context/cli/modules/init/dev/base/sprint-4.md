# Sprint 4: Template library (Library + reglas bunstart)

**Goal:** Completar el flujo `buns init` → Library: ejecutar `bun init` con template Library (según opciones que exponga Bun), aplicar reglas bunstart, instalar dependencias.

**Status:** Not started

## Scope

- Tipo **library** = template "Library" de Bun + aplicación de reglas bunstart.
- Bun en la doc muestra en el prompt interactivo la opción "Library"; puede no existir flag `--library`. Investigar: `bun init -y` con otro flag, o invocación no interactiva que seleccione Library (env var, stdin, o ejecutar `bun init` y enviar la tecla/opción correspondiente).

## Tasks

| # | Task | Status | Files |
|---|------|--------|-------|
| 1 | Investigar Bun CLI — comprobar si existe `bun init --library` o forma no interactiva de obtener template Library; si no existe, documentar fallback (p. ej. Blank + ajustes mínimos para library: package.json con "main"/"module"/"types" apropiados para lib) | pending | research |
| 2 | Extend BunRuntimePort — añadir `initLibrary(cwd: string): Promise<void>` (o reutilizar initBlank si Library no está disponible y se usa Blank como base) | pending | modify |
| 3 | BunRuntimeAdapter — implementar initLibrary: invocar la forma elegida (--library, o init -y + patch package.json para library) | pending | modify |
| 4 | Create `init/app/use-cases/BootstrapLibraryUseCase.ts` — initLibrary(cwd), ApplyBunstartRules.execute(cwd), installDependencies(cwd) | pending | new |
| 5 | ApplyBunstartRules para library — mismo flujo que api-rest (entry src/index.ts); las librerías suelen exportar desde src/index.ts y build a dist/ con declarations; el template bunstart.build.ts ya emite .d.ts | pending | verify |
| 6 | InitCommand — cuando selectedTemplate.type === 'library', llamar BootstrapLibraryUseCase.execute(cwd) | pending | modify |
| 7 | InitCommandFactory — instanciar BootstrapLibraryUseCase e inyectar en InitCommand | pending | modify |
| 8 | Build and verify — `buns init`, elegir Library, comprobar proyecto con src/index.ts, build que genera dist/ con .js y .d.ts | pending | verify |

## Acceptance criteria

- Usuario ejecuta `buns init`, elige "Library"; se crea un proyecto tipo librería con entry en src/, bunstart.build.ts (con declarations), scripts build/watch/dev; `bun install` ejecutado.
- El proyecto resultante puede publicarse como paquete (module, types, main apuntando a dist/).
- 0 lint errors. Build succeeds.

## Notes

- Si Bun no ofrece template Library por flag, alternativa: usar `bun init -y` y en ApplyBunstartRules o en un paso específico de BootstrapLibraryUseCase ajustar package.json (p. ej. "main": "dist/index.js", "module": "dist/index.js", "types": "dist/index.d.ts") y asegurar que el build emita declarations.
- Dependencia de Sprint 1 (ApplyBunstartRules).
