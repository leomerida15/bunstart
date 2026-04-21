# Features y Mejoras Core: @bunstart/pack

Este documento detalla la hoja de ruta técnica y las funcionalidades que convertirán a `@bunstart/pack` en el motor de construcción definitivo para el ecosistema Bunstart.

---

## I. Arquitectura de Construcción (Los 7 Mandamientos)

1.  **DTS Ultra-Rápido (Plugin Interno #1)**:
    *   **Implementación**: Plugin nativo de Bun que emite archivos `.d.ts` usando `isolatedDeclarations: true` (TS 5.5+).
    *   **Ventaja**: Es el método más rápido para generar declaraciones de tipo sin el overhead del type-checking completo.
    *   **Requisito**: Fomenta el uso de tipos explícitos en miembros exportados, mejorando la calidad del código.

2.  **Sistema de Plugins Nativo**:
    *   **Concepto**: Soporte 100% para la API `BunPlugin`.
    *   **Filosofía**: No crear wrappers propietarios innecesarios; aprovechar el ecosistema nativo de Bun para compatibilidad total con plugins de la comunidad.

3.  **La función `buildSetting()`**:
    *   **API**: `export const config = buildSetting({ ... })`.
    *   **Funcionalidad**: Punto de entrada centralizado que retorna un objeto con métodos `.build()`, `.serve()` y `.watch()`.
    *   **Inteligencia Contextual**: Deducción automática de entornos (`development` vs `production`) para aplicar optimizaciones sin configuración manual.

4.  **Plugins Externos (CSS Pipeline)**:
    *   **Scope**: Soporte para SCSS, Tailwind v4 y PostCSS.
    *   **Estrategia**: Se manejan como dependencias opcionales instaladas por el usuario (`@bunstart/plugin-scss`, etc.) para mantener el paquete `@bunstart/pack` ligero.

5.  **Build Frontend & Assets Públicos**:
    *   **Optimización Prod**: Inyección automática de hashes en HTML para JS/CSS.
    *   **Gestión de Assets**: Copia y resolución de imágenes/fuentes a una carpeta `public/` con rutas relativas robustas.

6.  **Estrategia de Externals Inteligente**:
    *   **Development**: Todo el `package.json` (dependencies + devDependencies) se marca como `external`. Bun resuelve esto instantáneamente, eliminando tiempos de bundle en dev.
    *   **Production**: Solo se externaliza lo definido por el usuario. El resto se empaqueta para un despliegue "zero-dependency".

---

## II. Inteligencia del CLI & Monorepo

7.  **Reverse Dependency Graph (Watch Incremental)**:
    *   **Lógica**: El CLI implementa un grafo inverso para detectar qué apps dependen de un paquete modificado.
    *   **Acción**: Al detectar cambios, solo se dispara el rebuild del paquete afectado y sus dependientes directos/indirectos.

8.  **Detección de `dist/` e Incrementalidad Real**:
    *   **Optimización**: Si el directorio `dist/` ya existe y el hash del contenido no ha variado, se salta el paso de construcción.

9.  **Content Hashing (SHA-256)**:
    *   **Método**: Generación de hashes del código fuente para validación de cambios real, ignorando metadatos de archivos (como fechas de modificación) que pueden ser engañosos.

---

## III. Mejoras Avanzadas (Inspiración Vite/Turbopack)

10. **Dev Server "On-demand"**:
    *   **Concepto**: Servidor inspirado en Vite que usa `Bun.serve` para entregar archivos individuales (unbundled ESM).
    *   **Resultado**: Tiempos de arranque constantes e instantáneos independientemente del tamaño del proyecto.

11. **HMR & Fast Refresh**:
    *   **Integración**: Soporte para Hot Module Replacement (vía `@prefresh/bun` o similar) para mantener el estado de React/Preact durante la edición.

12. **⚡ LightningCSS Integration**:
    *   **Uso**: Reemplazo de PostCSS/CssNano por `lightningcss` (escrito en Rust) para minificación y autoprefixing ultra-rápido.

13. **Persistent On-Disk Cache**:
    *   **Ubicación**: `.bunstart/cache`.
    *   **Persistencia**: Mantiene el estado de los builds entre sesiones, permitiendo arranques "warm" casi instantáneos.

14. **Compilación Estructurada vs Bundled**:
    *   **Flexibilidad**: A través de `buildSetting`, permitir cambiar entre un output que mantenga la estructura original de carpetas (`splitting: true` + `naming` específico) o un bundle único minificado por entrypoint.
