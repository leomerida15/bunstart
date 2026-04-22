# Proposal: pack-integration

## Intent

Integrar `@bunstart/pack` como build engine por defecto en el ecosistema bunstart, reemplazando los templates actuales que usan `Bun.build()` directo, y crear un Agent Skill que permita a agentes de AI usar bunstart CLI y pack a profundidad.

## Problem

1. **Templates usan Bun.build() directo** — Los templates de `bunstart.build.ts` usan `Bun.build()` + `tsc` manual. El usuario nunca se entera de que `@bunstart/pack` existe.

2. **Adopt no integra pack** — Cuando un proyecto externo se adopta al monorepo, no hay forma de migrar sus scripts a pack.

3. **No hay forma de que un agente AI use bunstart** — Un agente de AI no tiene contexto sobre cómo usar bunstart CLI ni @bunstart/pack.

## Scope

### In Scope
- Migrar templates de `bunstart.build.ts` para usar `buildSetting()` de `@bunstart/pack`
- Agregar `@bunstart/pack` como dependency automática en templates
- Comando `buns mono adopt --with-pack` para migrar proyectos existentes
- Comando `buns mono migrate-pack <alias>` para migrar workspaces existentes
- Crear Agent Skill `bunstart` que enseñe a AI a usar CLI + pack

### Out of Scope
- MCP server (fase futura)
- Cambios en @bunstart/pack本身 (pack funciona, solo hay que integrarlo)
- Detección automática de tipo de proyecto (el skill del agente lo hace)

## Approach

### Fase 1: Migrar templates a pack (CLI)

Los templates de `bunstart.build.ts` actuales:

```typescript
// ANTES: Bun.build() directo
await Bun.build({ entrypoints: ['src/index.ts'], ... });
const proc = Bun.spawn(['bun', 'run', 'tsc', ...]);
```

Pasán a:

```typescript
// DESPUÉS: buildSetting() de @bunstart/pack
import { buildSetting } from '@bunstart/pack';
const { build } = buildSetting({
  entrypoints: ['src/index.ts'],
  outdir: 'dist',
  target: 'bun',
  format: 'esm',
});
await build();
```

Templates afectados:
- `single-package/bunstart.build.ts.template`
- `single-package/bunstart.build.frontend.ts.template`
- `monorepo/apps/app-example/bunstart.build.ts.template`
- `monorepo/packages/pkg-example/bunstart.build.ts.template`

Y los scripts en `package.json` generados por `ApplyBunstartRulesAdapter`:
- Agregar `"@bunstart/pack": "workspace:*"` como dependency

### Fase 2: Adopt con pack

Nuevo flag `--with-pack` en `buns mono adopt`:
- Lee los scripts existentes del package.json
- Envuelve los scripts originales en `bunstart.config.ts` con sección `pack`
- Agrega `@bunstart/pack` como dependency

```typescript
// bunstart.config.ts generado
export default {
  pack: {
    build: { script: 'bun run build' },
    dev: { script: 'bun run dev' },
    start: { script: 'bun run start' }
  },
  repo: { ... }
};
```

### Fase 3: migrate-pack

Comando `buns mono migrate-pack <alias>`:
- Agrega `@bunstart/pack` como dependency del workspace
- Migra los scripts del package.json para usar pack
- Ejecuta `bun install`

### Fase 4: Agent Skill

Crear skill `bunstart` que el agente carga cuando trabaja con bunstart:

```
bunstart skill:
├── Conoce los comandos del CLI
├── Sabe configurar @bunstart/pack (buildSetting API)
├── Sabe migrar proyectos a pack
├── Patrones comunes (api-rest, frontend-react, library)
└── Troubleshooting
```

## Risks

1. **Breaking change en templates** — Los proyectos existentes que usan los templates viejos seguirán funcionando, solo los nuevos usarán pack
2. **pack no está publicado en npm** — Necesita estar disponible antes de que los templates lo referencien
3. **Adopt con pack puede romper scripts custom** — El envoltorio es no-destructivo, los scripts originales siguen funcionando

## Rollback Plan

Si pack falla, los templates pueden volver a usar `Bun.build()` directo. No hay cambios en pack本身.
