# @bunstart/pack: El Corazón del Ecosistema

Este paquete es un wrapper sobre `Bun.build`, `Bun.serve` y `Bun.watch` diseñado para simplificar el empaquetado y la ejecución de servidores de desarrollo y producción en monorepos de Bun.

## Requerimientos Core

1.  **DTS Ultra-Rápido**: Implementar un plugin de Bun que emita archivos `.d.ts` usando `isolatedDeclarations: true` (TS 5.5+). Es la forma más rápida de generar tipos sin procesar todo el grafo.
2.  **Sistema de Plugins Nativo**: Soporte total para la API `BunPlugin`. No inventamos nada raro, exponemos la interfaz de Bun para compatibilidad total con la comunidad.
3.  **Primer Plugin Interno**: El emisor de DTS será el primer plugin interno disponible en `pack`.
4.  **Función `buildSetting()`**: El punto de entrada central para configurar el build en cada workspace. Retorna un objeto preparado con métodos `.build()`, `.serve()` y `.watch()`.
5.  **Plugins Externos (CSS Pipeline)**: Soporte para SCSS, Tailwind v4 y PostCSS como dependencias opcionales instaladas por el usuario.
6.  **Build Frontend & Assets Públicos**: Asegurar que React/Frontend apps emitan assets correctamente (hashes en HTML, carpeta `public/` y rutas relativas robustas).
7.  **Estrategia de Externals**:
    *   **Dev**: Todo el `package.json` (deps + devDeps) se marca como `external`.
    *   **Prod**: Solo lo que el usuario pida explícitamente.

## Inteligencia del CLI (Integración con Pack)

8.  **Reverse Dependency Graph (Watch Inteligente)**: El CLI debe implementar un grafo inverso para re-buildear solo los paquetes afectados por un cambio.
9.  **Detección de `dist/` e Incrementalidad**: Si `dist/` existe y el hash del paquete (Content Hashing) no cambió, se salta el build.
10. **Content Hashing**: Generar hashes (SHA-256) de los fuentes para validación de cambios real, ignorando fechas de modificación de archivos.

## Mejoras de Arquitectura (Inspiradas en Vite/Turbopack)

11. **Dev Server "On-demand"**: Usar `Bun.serve` para entregar archivos individuales en dev (unbundled ESM) para un arranque instantáneo.
12. **HMR & Fast Refresh**: Integrar soporte para Hot Module Replacement en React/Preact para mantener el estado durante la edición.
13. **⚡ LightningCSS Integration**: Uso de `lightningcss` para procesamiento de CSS ultra-rápido (minificación y autoprefixing).
14. **Persistent On-Disk Cache**: Guardar el estado de los builds en `.bunstart/cache` para persistencia entre reinicios.
