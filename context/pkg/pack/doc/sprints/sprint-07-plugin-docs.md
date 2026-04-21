# Sprint 7: Plugin Documentation

**Status:** ✅ Completado
**Started:** 2026-04-21
**Completed:** 2026-04-21

## Intent

Documentar cómo usar plugins externos con `@bunstart/pack`. Este sprint es exclusivamente de documentación - no se implementó código nuevo.

## Why

`@bunstart/pack` implementa un plugin-system interno, pero la generación de archivos `.d.ts` se delega a plugins externos especializados. Esta documentación guía a los usuarios sobre qué plugins usar y cómo integrarlos.

## Scope

- [x] Documentar bun-plugin-isolated-decl para generación de .d.ts
- [x] Documentar otros plugins recomendados
- [x] Proveer ejemplos de uso
- [x] Explicar cómo registrarplugins externos

---

## Plugin Guide: Generación de Declaraciones (.d.ts)

### Recommended: bun-plugin-isolated-decl

**Por qué este plugin:**
- Generación rápida de `.d.ts` usando `tsc` directamente
- Soporta isolated declarations para tipos minimalistas
- Comunidad activa y bien mantenido
- No tiene limitaciones de path como otros plugins

### Instalación

```bash
bun add -d bun-plugin-isolated-decl
# o con npm
npm install -D bun-plugin-isolated-decl
```

### Uso Básico

```typescript
// src/build.ts
import { buildSetting } from "@bunstart/pack";
import { isolatedDecl } from "bun-plugin-isolated-decl";

const { build } = buildSetting({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  plugins: [isolatedDecl()],  // Agregar el plugin
});

await build();
// Genera: ./dist/index.js + ./dist/index.d.ts
```

### Opciones Avanzadas

```typescript
import { isolatedDecl } from "bun-plugin-isolated-decl";

const plugin = isolatedDecl({
  // Directorio de salida de .d.ts
  outDir: "./dist",
  // Root directory del proyecto
  rootDir: ".",
  // Patrones a incluir
  include: ["src/**/*.ts"],
  // Patrones a excluir
  exclude: ["src/**/*.test.ts"],
  // Generating isolated declarations
  isolatedDecl: true,
  // Eliminar comentarios JSDoc
  removeDuration: false,
  // Verbose output
  verbose: true,
});

const { build } = buildSetting({
  entrypoints: ["./src/index.ts"],
  plugins: [plugin],
});
```

---

## Plugin Guide: Otros Plugins Útiles

### 1. minidenticons (generación de avatares)

```bash
bun add -d minidenticons
```

```typescript
import { minidenticonPlugin } from "minidenticons";

const { build } = buildSetting({
  entrypoints: ["./src/index.ts"],
  plugins: [minidenticonPlugin()],
});
```

### 2. bun-plugin-sql (SQLite embebido)

```bash
bun add -d bun-plugin-sql
```

```typescript
import { VirtualFilePlugin } from "bun-plugin-sql";
import myDB from "./db.sqlite";

const { build } = buildSetting({
  entrypoints: ["./src/index.ts"],
  plugins: [VirtualFilePlugin(myDB)],
});

// El archivo SQLite se embebe en el bundle
```

### 3. @aspect/build-plugin (decorators)

```bash
bun add -d @aspect/build-plugin
```

```typescript
import { aspect } from "@aspect/build-plugin";

const { build } = buildSetting({
  entrypoints: ["./src/index.ts"],
  plugins: [aspect()],
  target: "node",
});
```

---

## Cómo Registrar Plugins Externos

### En buildSetting()

```typescript
import { buildSetting } from "@bunstart/pack";
import somePlugin from "some-bun-plugin";

const { build, serve, watch } = buildSetting({
  entrypoints: ["./src/index.ts"],
  plugins: [somePlugin()],  // Array de BunPlugin
});
```

### Integración con el plugin-system interno

El `plugin-system` interno de `@bunstart/pack` puede registrar plugins externos:

```typescript
// Registrar manualmente
const pluginRegistry = getPluginRegistry();
pluginRegistry.register(somePlugin, {
  type: "external",
  phase: "pre-build",  // pre-build, post-build
  priority: 10,
});
```

---

## API de BunPlugin

Los plugins deben cumplir con la interfaz `BunPlugin`:

```typescript
interface BunPlugin {
  name: string;
  setup(build: Build): void | Promise<void>;
}

interface Build {
  // Agregar un loader para un tipo de archivo
  onLoad(filter: glob, callback: (args) => Promise<{ contents: string }>): void;
  
  // Transformar archivo antes del bundling
  onTransform(filter: glob, callback: (args) => Promise<{ code: string }>): void;
  
  // Hook chamado antes de iniciar el build
  onStart(callback: () => void | Promise<void>): void;
}
```

---

## Troubleshooting

### "Plugin not found"

```bash
# Verificar que está instalado
bun add -d nombre-del-plugin
```

### ".d.ts not generated"

```bash
# Verificar que el plugin está en el array de plugins
const { build } = buildSetting({
  entrypoints: ["./src/index.ts"],
  plugins: [isolatedDecl()],  // Agregar aquí
});
```

### "Type error during declaration emit"

El plugin usa `isolatedDecl: true` que requiere tipos explícitos:

```typescript
// ❌ No funciona con isolated declarations
export function hello(name) {
  return `Hello ${name}`;
}

// ✅ Funciona
export function hello(name: string): string {
  return `Hello ${name}`;
}
```

---

## Recursos

- [bun-plugin-isolated-decl npm](https://www.npmjs.com/package/bun-plugin-isolated-decl)
- [Bun Plugin API Docs](https://bun.sh/docs/bundling Plugins)
- [Bun Plugins Awesome List](https://github.com/agent-network/bun-plugins)

---

## Acceptance Criteria

- [x] Documentado bun-plugin-isolated-decl con ejemplos
- [x] Documentados otros plugins útiles
- [x] Explicado cómo registrar plugins
- [x] Secciones de troubleshooting incluidas
- [x] Links a recursos externos

---

## Deliverables

Este sprint NO entrega código. Solo entrega:

1. `context/pkg/pack/doc/sprints/sprint-07-plugin-docs.md` — esta documentación
2. Actualización de `status.md` — roadmap completado