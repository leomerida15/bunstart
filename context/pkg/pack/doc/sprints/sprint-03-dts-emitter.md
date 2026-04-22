# Sprint 3: dts-emitter

## Context

> ⚠️ **Decision de Arquitectura (2026-04-21):** Este módulo existe como abstracción, pero NO implementamos la generación de .d.ts internamente. Recomendamos usar **bun-plugin-isolated-decl** como plugin externo para generación de declaraciones.

### Recomendación: bun-plugin-isolated-decl

```bash
bun add -d bun-plugin-isolated-decl
```

```typescript
import { isolatedDecl } from "bun-plugin-isolated-decl";

await Bun.build({
  entrypoints: ["./src/index.ts"],
  plugins: [isolatedDecl()],
});
```

**Por qué bun-plugin-isolated-decl:**
- Usa el compilador de TypeScript directamente (tsc)
- Genera .d.ts correctos sin type-checking completo
- Mucho más rápido que tsc --declarations
- Soporta isolated declarations para tipos minimalistas
- Comunidad activa y mantenida

### Antigua idea (DESCARTADA)

Intentamos usar `isolatedDeclarations: true` de TypeScript 5.5+, pero NO existe como API pública en Bun.Tampoco usamos `bun-plugin-dts` por limitaciones en el manejo de paths.

## Dependencies

- **Depende de**: Sprint 2 (plugin-system) - es un plugin que se registra en el sistema.
- **Dependientes**: Ninguno directamente, pero es consumido por el build-engine via plugin-system.

## Status: ✅ COMPLETADO (2026-04-10)

El módulo dts-emitter fue implementado con arquitectura hexagonal, pero como **interfaz de configuración** que delega al plugin externo.

**Lo que se implementó:**
- Domain: DtsConfig, DtsEmitterResult, DtsEmitterError
- Ports: DtsEmitterPort
- Use Cases: EmitDtsUseCase
- Infra: BunPluginDtsAdapter (stub que indica usar plugin externo)

**No se implementó:** Generación real de .d.ts (delegado a bun-plugin-isolated-decl)

## Estructura del Modulo

```
modules/dts-emitter/
├── domain/
│   ├── entities/
│   │   └── DtsEmitterError.ts          # Errores del emisor
│   ├── value-objects/
│   │   ├── DtsConfig.ts                 # Configuracion del emisor
│   │   └── DtsEmitterResult.ts         # Resultado de la emision
│   └── ports/
│       └── DtsEmitter.port.ts           # Interface para emitir declaraciones
├── app/
│   └── use-cases/
│       └── EmitDtsUseCase.ts            # Orquesta la emision de .d.ts
├── infra/
│   ├── adapters/
│   │   └── BunPluginDtsAdapter.ts      # Adapter (stub, delega a plugin externo)
│   └── factories/
│       └── DtsEmitterFactory.ts
└── index.ts
```

## Uso Recomendado

```typescript
// En tu proyecto
import { buildSetting } from "@bunstart/pack";
import { isolatedDecl } from "bun-plugin-isolated-decl";

const { build } = buildSetting({
  entrypoints: ["./src/index.ts"],
  plugins: [isolatedDecl()],
});

await build(); // Genera ./dist/index.js + ./dist/index.d.ts
```

## Por qué no integramos bun-plugin-isolated-decl internamente

1. **Mantenimiento**: El plugin evoluciona independientemente
2. **Flexibilidad**: Permite configurar opciones avanzadas
3. **Simplicidad**: No duplicamos dependencias en @bunstart/pack
4. **Best practice**: Cada herramienta hace lo que mejor sabe hacer
