# @bunstart/pack

El motor de construcción y servidor de desarrollo para el ecosistema **Bunstart**.

`@bunstart/pack` es un wrapper minimalista y extremadamente rápido sobre las APIs nativas de Bun (`Bun.build`, `Bun.serve`, `Bun.watch`). Su objetivo es unificar la experiencia de construcción en monorepos de Bun, permitiendo que cada workspace defina su lógica de empaquetado de forma sencilla y declarativa.

## Características Principales

-   **`buildSetting()` API**: Una única función para configurar builds de Frontend (React), Librerías (DTS) y Servidores.
-   **Isolated DTS Plugin**: Generación de tipos TypeScript ultra-rápida usando `isolatedDeclarations`.
-   **Smart Externals**: Gestión automática de dependencias externas. En desarrollo (`dev`), todo el `package.json` es externo para un arranque instantáneo. En producción (`build`), se empaqueta todo para un despliegue sin dependencias.
-   **Native ESM Dev Server**: Servidor de desarrollo inspirado en Vite que aprovecha el motor de Bun para servir archivos bajo demanda con HMR.
-   **Full Bun Compatibility**: Soporta el sistema de plugins nativo de Bun.

## Uso Básico

Cada workspace del monorepo debe tener un archivo `bunstart.build.ts` que utilice la API de `@bunstart/pack`:

```typescript
// apps/web/bunstart.build.ts
import { buildSetting } from "@bunstart/pack";

const config = buildSetting({
  type: 'frontend',
  entry: './src/index.tsx',
  outdir: './dist',
  plugins: [
    // Plugins estándar de Bun
  ]
});

// El CLI de bunstart llamará a estos métodos
export const build = () => config.build();
export const watch = () => config.watch();
```

## Arquitectura de @bunstart/pack

Este paquete implementa una lógica de empaquetado "agresiva":

1.  **Detección de Cambios por Hash**: Utiliza hashing de contenido (SHA-256) para determinar si un paquete necesita ser reconstruido.
2.  **Grafo de Dependencias Inverso**: Integrado con el CLI de Bunstart para reconstruir solo los paquetes que dependen de un módulo modificado.
3.  **Optimizaciones de Producción**: Minificación de JS/CSS nativa y gestión de assets (imágenes, fuentes) con inyección de hashes en el HTML.
