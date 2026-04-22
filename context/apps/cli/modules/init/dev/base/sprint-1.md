# Sprint 1: Aplicar reglas bunstart a proyecto single-package

**Goal:** Implementar la lógica reutilizable que aplica las reglas bunstart a un proyecto ya creado por `bun init` (blank, react, library). Así api-rest, frontend-react y library solo ejecutan el template de Bun y luego aplican estas reglas.

**Status:** Done

## Reglas bunstart (single-package)

1. **Build, watch y comandos:** Añadir `bunstart.build.ts`, `bunstart.watch.ts` y en `package.json` los scripts: `build`, `watch`, `dev`, `start` (entry en `dist/`).
2. **Entry en src:** Mover el main de `index.ts` / `index.tsx` a `src/index.ts` o `src/index.tsx`; actualizar `package.json` (`module`, `main`, `types`) y `tsconfig` si aplica.
3. **bunstart.config:** No se crea en init; el usuario puede usar `buns mono sync` (en monorepo) o un futuro comando para registrar el proyecto.

## Tasks

| # | Task | Status | Files |
|---|------|--------|-------|
| 1 | Create `init/domain/ports/ApplyBunstartRules.port.ts` — `execute(cwd: string, options?: { entryExt?: 'ts' \| 'tsx' }): Promise<void>` | done | new |
| 2 | Create `init/app/use-cases/ApplyBunstartRulesUseCase.ts` — orquesta: leer package.json, mover entry a src/, escribir bunstart.build.ts y bunstart.watch.ts, parchear package.json con scripts y module/main/types | done | new |
| 3 | Create templates en `src/utils/template/single-package/` — bunstart.build.ts.template, bunstart.watch.ts.template (entrypoints `src/index.ts` genérico; tsx si options.entryExt) | done | new |
| 4 | Create `init/infra/adapters/ApplyBunstartRulesAdapter.ts` — implementa el port: FilesystemPort, PackageJsonPort; lógica para mover archivo, copiar templates, interpolación mínima | done | new |
| 5 | Wire ApplyBunstartRulesUseCase en InitCommandFactory (para uso desde Bootstrap* use cases) | done | modify |
| 6 | Build and verify — unit test o e2e: en un dir con `bun init -y`, ejecutar ApplyBunstartRules y comprobar que existe src/index.ts, bunstart.build.ts, scripts en package.json | done | verify |

## Acceptance criteria

- Dado un directorio con proyecto creado por `bun init -y` (index.ts en raíz), ApplyBunstartRules deja: `src/index.ts`, `bunstart.build.ts`, `bunstart.watch.ts`, y package.json con scripts build/watch/dev/start y module/main apuntando a dist/.
- Soporte opcional para entry `index.tsx` (frontend React) vía options.entryExt.
- 0 lint errors. Build succeeds.

## Notes

- El adapter puede reutilizar NodeFilesystemAdapter y PackageJsonAdapter ya existentes en init.
- bunstart.build.ts para single-package puede ser el mismo patrón que el de app-example (Bun.build entrypoints ['src/index.ts'], outdir 'dist', tsc declarations).
- Si el proyecto ya tiene `src/index.ts`, no sobrescribir; solo asegurar que package.json y scripts estén actualizados.
