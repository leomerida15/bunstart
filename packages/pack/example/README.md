# @bunstart/pack Example

Demo de如何使用 `@bunstart/pack` 进行开发。

## Uso

```bash
# Ejecutar el ejemplo
bun run example
```

Esto va a:
1. Compilar `./example/src/index.ts` → `./example/dist/index.js`
2. Iniciar un servidor en `http://localhost:3000`
3. Watchear cambios en `./example/src/` y auto-rebuild

## Estructura

```
example/
├── src/
│   └── index.ts      # Tu código TypeScript
├── public/
│   └── index.html    # HTML con el bundle
├── dist/             # Output generado (auto)
└── dev.ts           # Script de desarrollo
```

## API

```typescript
import { buildSetting } from "@bunstart/pack";

const { build, serve, watch } = buildSetting({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
});

// Solo build
await build();

// Servidor estático
await serve({ port: 3000, root: "./public" });

// Watch + serve + auto-rebuild
const handle = await watch({
  port: 3000,
  root: "./public",
  watchPaths: ["./src"],
  debounceMs: 100,
});

// Limpiar
await handle.stop();
```

## Prueba

1. Ejecutá `bun run example`
2. Abrí http://localhost:3000
3. Editá `src/index.ts` (cambiá el mensaje)
4. Guardá y mirá el rebuild automático
