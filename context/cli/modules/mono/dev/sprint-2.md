# Sprint 2: Remove workspace

**Goal:** Implementar `mono remove app|pkg <name>` para eliminar un workspace del config, actualizar dependsOn en otros workspaces, y opcionalmente borrar el directorio.

**Status:** Done

## Tasks

| # | Task | Status | Files |
|---|------|--------|-------|
| 1 | Create `mono/app/use-cases/RemoveAppUseCase.ts` — load config, quitar entrada de apps, actualizar dependsOn en apps y packages que referencien al app, patch config, save | done | new |
| 2 | Create `mono/app/use-cases/RemovePackageUseCase.ts` — load config, quitar entrada de packages, actualizar dependsOn en apps y packages que referencien al pkg, patch config, save | done | new |
| 3 | (Optional) Add flag or option to delete directory — RemoveApp/RemovePackage podrían recibir `deleteDir: boolean`; crear port `DeleteWorkspaceDir.port.ts` si se desea borrar el directorio físicamente | deferred | new |
| 4 | MonoCommand: add subcommand `remove` — args: `remove app <name>` o `remove pkg <name>`; validar que el workspace exista antes de eliminar | done | modify |
| 5 | Wire RemoveAppUseCase and RemovePackageUseCase in MonoCommandFactory | done | modify |
| 6 | Update MonoCommand help — documentar `buns mono remove app <name>` y `buns mono remove pkg <name>` | done | modify |
| 7 | Build and verify — `buns mono remove app my-app`, `buns mono remove pkg shared-utils` | done | verify |

## Acceptance criteria

- `buns mono remove app my-app` elimina el app del config y limpia dependsOn en otros workspaces.
- `buns mono remove pkg shared-utils` elimina el package del config y limpia dependsOn.
- Si el workspace no existe, error claro.
- 0 lint errors.
- Build succeeds.

## Notes

- La decisión de borrar o no el directorio puede diferirse: por ahora basta actualizar config. El borrado de directorio puede ser un follow-up.
- Validar que el alias exista en repo.apps o repo.packages antes de llamar al use case.
