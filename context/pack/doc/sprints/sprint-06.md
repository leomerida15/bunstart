# Sprint 6: Dev Server

**Status:** 🔲 En progreso
**Started:** 2026-04-21
**Target:** 2026-04-21

## Intent

Implementar el módulo `dev-server` para servir aplicaciones en desarrollo con hot reload automático. Este módulo es el más complejo de `@bunstart/pack` porque combina múltiples capacidades: servidor HTTP con Bun.serve(), file watching, y WebSocket para HMR.

## Dependency Graph

```
Sprint 1 (build-engine) ──┬─> Sprint 6 (dev-server)
                          │
Sprint 2 (plugin-system) ─┘
```

Sprint 6 depende de:
- Sprint 1 (build-engine): para compilar archivos
- Sprint 2 (plugin-system): para cargar plugins de servidor

## Scope

### Domain Entities

- [x] `DevServerConfig`: configuración del servidor (puerto, host, root)
- [ ] `HotReloadConfig`: configuración de HMR (enabled, websocket path, events)

### Domain Value Objects

- [ ] `ServerPort`: puerto del servidor (validación 1024-65535)
- [ ] `ServerHost`: host del servidor (localhost, 0.0.0.0, o IP)
- [ ] `ReloadStrategy`: strategy de reload (full, module, none)

### Domain Ports

- [ ] `DevServerPort`: interfaz para el servidor HTTP
- [ ] `FileWatcherPort`: interfaz para detectar cambios de archivos
- [ ] `HmrConnectionPort`: interfaz para WebSocket HMR

### Infra Adapters

- [ ] `BunServeAdapter`: implementa DevServerPort usando Bun.serve()
- [ ] `FsWatcherAdapter`: implementa FileWatcherPort usando node:fs.watch
- [ ] `BunWebSocketAdapter`: implementa HmrConnectionPort

### App Use Cases

- [ ] `StartDevServerUseCase`: inicia el servidor de desarrollo
- [ ] `WatchFilesUseCase`: observa cambios y notifica a clientes
- [ ] `ReloadClientUseCase`: envía señal de reload a clientes via WS

## API Design

```typescript
// src/index.ts
export interface BuildEnginePublicAPI {
  build(): Promise<void>;
  serve(): Promise<void>;      // <-- Sprint 6
  watch(): Promise<void>;     // <-- Sprint 6
}

// Uso típico
const { serve, watch } = buildSetting({ entrypoints: ["./src/index.ts"] });

// Servir archivos estáticos
await serve({ port: 3000, root: "./public" });

// Watch mode con HMR
await watch({ port: 3000, hmr: true });
```

## Implementation Notes

### Bun.serve() Integration

Usamos `Bun.serve()` porque:
1. Soporte nativo de WebSocket (para HMR)
2. Sirve archivos estáticos con `Bun.file()`
3. Desarrollo mode con HMR integrado

### File Watching Strategy

- Usar `node:fs.watch()` para watch mode básico (ya existe en bunstart.watch.ts)
- El watcher observa `src/` y otros directorios configurados
- Debounce de 100ms para evitar rebuilds múltiples

### HMR Protocol

1. Cliente conecta por WebSocket a `/__hmr`
2. Servidor mantiene lista de conexiones activas
3. Cuando cambia un archivo, servidor envía `{ "type": "reload", "files": [...] }`
4. Cliente recibe y hace reload de módulos afectados

### Error Handling

- Si el servidor no puede iniciar (puerto ocupado), arrojar `DevServerError`
- Si el watcher falla, hacer fallback a rebuild on demand
- Logger centralizado para todas las operaciones

## Acceptance Criteria

- [ ] `serve()` inicia servidor HTTP en puerto configurado
- [ ] `serve()` sirve archivos estáticos desde root directory
- [ ] `watch()` inicia servidor + watcher en paralelo
- [ ] `watch()` detecta cambios en archivos fuente
- [ ] `watch()` recompila y reinicia automáticamente
- [ ] WebSocket HMR conecta y recibe eventos
- [ ] Errores de puerto ocupado son capturados y reportados
- [ ] Tests cubren los adapters principales

## Deliverables

1. `packages/pack/src/modules/dev-server/`
   - `domain/` — entidades, value objects, ports
   - `app/` — use cases
   - `infra/` — adapters, factories
2. Tests en archivos `.test.ts`
3. Exports en `index.ts`

## Notes

Este es el sprint más complejo porque combina:
- I/O asíncrono (servidor, sockets)
- File watching (sistema de archivos)
- Hot reload (comunicación cliente-servidor)
- Integración con build-engine para recompilar

Importante: empezar por los ports y entities del domain antes de los adapters.