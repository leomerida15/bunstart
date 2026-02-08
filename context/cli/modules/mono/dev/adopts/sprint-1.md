# Sprint 1: Adopt proyecto existente (ya en apps/ o packages/)

**Goal:** Implementar `buns mono adopt app|pkg <name>` para registrar un proyecto que ya existe bajo `apps/<name>` o `packages/<name>` en el monorepo: actualizar su `package.json` con el nombre con scope del monorepo (`@scope/name`), añadirlo a `bunstart.config`, y ejecutar `bun install` en la raíz.

**Status:** Not started

## Scope

- El proyecto adoptado **ya está** en `apps/<name>` o `packages/<name>` (carpeta y package.json existen).
- **No** se crea código nuevo (no scaffold); solo se registra en config y se actualiza el nombre del paquete.
- Sintaxis: `buns mono adopt app <name>` | `buns mono adopt pkg <name>`.

## Tasks

| # | Task | Status | Files |
|---|------|--------|-------|
| 1 | Add `adopt` to ReservedNames — evitar que un workspace se llame "adopt" | pending | modify |
| 2 | Create port (optional) or reuse — lectura/escritura de package.json del workspace; el módulo init ya tiene PackageJsonPort; mono puede depender de init o definir un port local para "patch package name" | pending | design |
| 3 | Create `mono/app/use-cases/AdoptProjectUseCase.ts` — recibe cwd, tipo (app|pkg), name; valida que exista apps/name o packages/name con package.json; obtiene scope (getScope desde config); forma packageName = @scope/name; patchea package.json del proyecto con { name: packageName }; llama AddAppUseCase o AddPackageUseCase con (cwd, name, packageName, dependsOn); opcionalmente lee dependsOn del package.json del proyecto (workspace:* deps) o deja []; RunBunInstall en cwd | pending | new |
| 4 | Resolve workspace path — dado name y tipo, path = join(cwd, type === 'app' ? 'apps' : 'packages', name); validar que exista y que tenga package.json | pending | new/modify |
| 5 | MonoCommand: add subcommand `adopt` — args: `adopt app <name>` o `adopt pkg <name>`; validar que la carpeta exista; llamar AdoptProjectUseCase | pending | modify |
| 6 | Wire AdoptProjectUseCase in MonoCommandFactory — inyectar dependencias (LoadConfig, PatchConfig o config-state, AddApp, AddPackage, RunBunInstall; para patchear package.json del adoptado puede usarse PackageJsonAdapter de init o un port en mono) | pending | modify |
| 7 | Update MonoCommand help — documentar `buns mono adopt app <name>` y `buns mono adopt pkg <name>` | pending | modify |
| 8 | Build and verify — `buns mono adopt app client` con apps/client existente; comprobar que bunstart.config tiene client en repo.apps y que apps/client/package.json tiene name "@scope/client"; bun install ejecutado | pending | verify |

## Acceptance criteria

- `buns mono adopt app client` (con `apps/client` existente) registra el app en config y actualiza `apps/client/package.json` con `"name": "@<scope>/client"`.
- `buns mono adopt pkg my-lib` (con `packages/my-lib` existente) registra el package en config y actualiza el name con scope.
- Si el workspace ya está en config, error claro.
- Si la carpeta no existe o no tiene package.json, error claro.
- 0 lint errors. Build succeeds.

## Notes

- dependsOn del entry adoptado: se puede dejar vacío inicialmente; un siguiente paso podría inferir dependsOn desde las dependencias workspace:* del package.json del proyecto.
- Reutilizar getScope(repo) como en handleGenerate; AddAppUseCase y AddPackageUseCase ya existen y no crean archivos, solo actualizan config.
