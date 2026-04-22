# Sprint 6: dev-server

## Context

Dev server inspirado en Vite que usa `Bun.serve` para entregar archivos individuales en modo unbundled ESM. El objetivo es tiempos de arranque constantes e instantaneos independientemente del tamanio del proyecto. Incluye HMR (Hot Module Replacement) y Fast Refresh para React/Preact, manteniendo el estado de componentes durante la edicion.

Este es el sprint mas ambicioso y complejo de todo el roadmap.

## Dependencies

- **Depende de**: Sprint 1 (build-engine) para configuracion base, Sprint 2 (plugin-system) para transformacion de modulos.
- **Dependientes**: Ninguno. Es el sprint final.

## Estructura del Modulo

```
modules/dev-server/
├── domain/
│   ├── entities/
│   │   ├── ServerConfig.ts            # Configuracion del dev server (port, host, etc.)
│   │   ├── ModuleNode.ts              # Nodo en el grafo de modulos
│   │   └── HmrUpdate.ts              # Representa un update HMR pendiente
│   ├── value-objects/
│   │   ├── ModulePath.ts              # Ruta de modulo validada y normalizada
│   │   └── ServerAddress.ts           # host:port validado
│   ├── ports/
│   │   ├── HttpServer.port.ts         # Interface para el server HTTP
│   │   ├── FileWatcher.port.ts        # Interface para watch de archivos
│   │   ├── HmrChannel.port.ts        # Interface para canal HMR (WebSocket)
│   │   └── ModuleTransformer.port.ts  # Interface para transformar modulos on-demand
│   └── services/
│       ├── ModuleGraphService.ts      # Grafo de dependencias de modulos
│       └── HmrBoundaryResolver.ts     # Determina que modulos actualizar via HMR
├── app/
│   └── use-cases/
│       ├── StartDevServerUseCase.ts         # Arranca el server completo
│       ├── HandleModuleRequestUseCase.ts    # Sirve un modulo individual (on-demand)
│       ├── HandleHmrUpdateUseCase.ts        # Procesa un cambio y envia HMR update
│       └── StopDevServerUseCase.ts          # Graceful shutdown
├── infra/
│   ├── adapters/
│   │   ├── BunServeAdapter.ts              # Implementa HttpServerPort con Bun.serve
│   │   ├── BunFileWatcherAdapter.ts        # Implementa FileWatcherPort con fs.watch
│   │   ├── WebSocketHmrAdapter.ts          # Implementa HmrChannelPort con WebSocket
│   │   └── BunModuleTransformerAdapter.ts  # Transforma TS/JSX a ESM on-the-fly
│   └── factories/
│       └── DevServerFactory.ts
├── client/
│   └── hmr-client.ts                       # Script inyectado en el browser para HMR
└── index.ts
```

## Pasos a Ejecutar

### Paso 1: Domain Layer
- [ ] Definir `ServerConfig` entity (port, host, root, hmr options)
- [ ] Definir `ModuleNode` entity (id, url, importers, importees, transformedCode)
- [ ] Definir `HmrUpdate` entity (type: full-reload | update, modules, timestamp)
- [ ] Implementar `ModulePath` VO
- [ ] Implementar `ServerAddress` VO
- [ ] Definir `HttpServerPort` interface
- [ ] Definir `FileWatcherPort` interface
- [ ] Definir `HmrChannelPort` interface (send, broadcast, onConnection)
- [ ] Definir `ModuleTransformerPort` interface
- [ ] Implementar `ModuleGraphService` - mantiene grafo de dependencias en memoria
- [ ] Implementar `HmrBoundaryResolver` - determina propagacion de updates

### Paso 2: Application Layer
- [ ] Implementar `StartDevServerUseCase` - inicia server + watcher + HMR
- [ ] Implementar `HandleModuleRequestUseCase` - transforma y sirve modulos
- [ ] Implementar `HandleHmrUpdateUseCase` - detecta cambio, propaga via grafo, envia update
- [ ] Implementar `StopDevServerUseCase` - limpieza de recursos

### Paso 3: Infrastructure Layer
- [ ] Implementar `BunServeAdapter` con `Bun.serve()`
- [ ] Implementar `BunFileWatcherAdapter` con `fs.watch`
- [ ] Implementar `WebSocketHmrAdapter` con WebSocket nativo de Bun
- [ ] Implementar `BunModuleTransformerAdapter` - usa Bun transpiler para TS/JSX -> ESM
- [ ] Implementar `DevServerFactory`

### Paso 4: HMR Client
- [ ] Crear `hmr-client.ts` - script inyectado en HTML del browser
- [ ] WebSocket connection al dev server
- [ ] Handler para `module-update` events
- [ ] Handler para `full-reload` events
- [ ] Integrar con React Fast Refresh (`$RefreshReg$` / `$RefreshSig$`)

### Paso 5: Integracion
- [ ] Exponer `.serve()` desde `buildSetting()` que arranca el dev server
- [ ] Exponer `.watch()` que combina file watching + incremental rebuild
- [ ] Integrar con plugin-system para transformaciones custom
- [ ] Documentar API con JSDoc

### Paso 6: Tests
- [ ] Tests unitarios para ModuleGraphService
- [ ] Tests unitarios para HmrBoundaryResolver
- [ ] Test de integracion: servir un modulo TS como ESM
- [ ] Test de integracion: cambiar archivo -> HMR update enviado via WebSocket
- [ ] Test E2E: dev server con proyecto React minimal, editar componente -> Fast Refresh

## Status

- [ ] Paso 1: Domain Layer
- [ ] Paso 2: Application Layer
- [ ] Paso 3: Infrastructure Layer
- [ ] Paso 4: HMR Client
- [ ] Paso 5: Integracion
- [ ] Paso 6: Tests
