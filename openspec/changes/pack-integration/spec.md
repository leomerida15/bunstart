# Spec: pack-integration

## Requirements

### REQ-1: Templates usan @bunstart/pack

**Priority**: MUST  
**Rationale**: El punto de entrada del ecosistema son los templates. Si no usan pack, el usuario nunca lo descubre.

#### REQ-1.1: Template de backend (single-package y monorepo/app)

El template `bunstart.build.ts` generado para proyectos backend DEBE usar `buildSetting()` de `@bunstart/pack` en lugar de `Bun.build()` directo.

```typescript
// Template generado
import { buildSetting } from '@bunstart/pack';

export async function build(): Promise<void> {
  const { build: packBuild } = buildSetting({
    entrypoints: ['src/index.ts'],
    outdir: 'dist',
    target: 'bun',
    format: 'esm',
    minify: false,
    sourcemap: false,
  });
  await packBuild();
}
```

#### REQ-1.2: Template de frontend

El template `bunstart.build.ts` generado para proyectos frontend DEBE usar `buildSetting()` de `@bunstart/pack`.

#### REQ-1.3: Template de library (monorepo/pkg)

El template `bunstart.build.ts` generado para paquetes library DEBE usar `buildSetting()` de `@bunstart/pack` con `dts: true` habilitado para emitir declaration files.

#### REQ-1.4: @bunstart/pack como dependency automática

Cuando el CLI genera un proyecto nuevo (create, generate), DEBE agregar `@bunstart/pack` como dependency en el `package.json` del proyecto.

### REQ-2: Adopt con pack por defecto

**Priority**: MUST  
**Rationale**: Todos los proyectos adoptados deben usar pack por defecto para mantener consistencia en el ecosistema.

#### REQ-2.1: Pack por defecto en adopt

El comando `buns mono adopt` DEBE aplicar `@bunstart/pack` automáticamente:
- Agregar `@bunstart/pack` como dependency
- Crear/actualizar `bunstart.config.ts` con sección `pack` que envuelve scripts existentes
- El flag `--from` es OPCIONAL (no requerido)

#### REQ-2.2: Envoltorio no-destructivo

Cuando se adopta un proyecto, los scripts originales del package.json NO DEBEN ser eliminados. El CLI debe:
- Crear `bunstart.config.ts` con sección `pack` que referencia los scripts originales
- Los scripts originales siguen funcionando como fallback
- El proyecto puede operar con o sin pack

### REQ-3: migrate-pack

**Priority**: MAY  
**Rationale**: Permite migrar workspaces que ya están en el monorepo.

#### REQ-3.1: Comando migrate-pack

El comando `buns mono migrate-pack <alias>` DEBE:
- Agregar `@bunstart/pack` como dependency del workspace
- Actualizar los scripts del package.json para usar pack
- Ejecutar `bun install`

### REQ-4: Agent Skill bunstart

**Priority**: MUST  
**Rationale**: Los agentes de AI necesitan contexto para usar bunstart CLI y pack correctamente.

#### REQ-4.1: Skill para agentes

Crear un Agent Skill llamado `bunstart` que:
- Documente los comandos del CLI
- Explique la API de `buildSetting()` de @bunstart/pack
- Proporcione patrones de configuración por tipo de proyecto
- Incluya troubleshooting común

#### REQ-4.2: Disponibilidad del skill

El skill DEBE estar disponible para cualquier agente de AI que trabaje en un proyecto bunstart. Se instala en `.opencode/skills/` o `.agents/skills/`.

---

## Scenarios

### Scenario 1: Usuario crea un app nuevo

```
GIVEN un monorepo bunstart existente
WHEN el usuario ejecuta "buns mono generate app my-api --template api-rest"
THEN el CLI crea el app con @bunstart/pack como dependency
AND el bunstart.build.ts usa buildSetting() de @bunstart/pack
AND el usuario puede ejecutar "buns my-api build" y funciona
```

### Scenario 2: Usuario adopta un proyecto (siempre con pack)

```
GIVEN un proyecto externo en ../external-api con scripts de build
WHEN el usuario ejecuta "buns mono adopt app external-api --from ../external-api"
THEN el CLI copia el proyecto al monorepo
AND agrega @bunstart/pack como dependency
AND crea bunstart.config.ts con sección pack que envuelve los scripts originales
AND los scripts originales siguen funcionando como fallback
```

```
GIVEN un proyecto existente en apps/my-api dentro del monorepo
WHEN el usuario ejecuta "buns mono adopt app my-api"
THEN el CLI agrega @bunstart/pack como dependency
AND crea bunstart.config.ts con sección pack
AND el proyecto queda listo para usar pack
```

### Scenario 3: Agente AI configura pack

```
GIVEN un proyecto bunstart sin @bunstart/pack configurado
WHEN un agente de AI con el skill bunstart trabaja en el proyecto
THEN el agente sabe cómo agregar @bunstart/pack como dependency
AND sabe configurar buildSetting() según el tipo de proyecto
AND puede ejecutar "buns mono migrate-pack <alias>" para migrar
```

### Scenario 4: Usuario migra un workspace existente

```
GIVEN un workspace "cli" en el monorepo que usa Bun.build() directo
WHEN el usuario ejecuta "buns mono migrate-pack cli"
THEN el CLI agrega @bunstart/pack como dependency
AND actualiza bunstart.build.ts para usar buildSetting()
AND ejecuta bun install
```
