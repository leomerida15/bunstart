# Sprint 3: dts-emitter

## Context

Primer plugin interno del ecosistema. Genera archivos `.d.ts` usando `isolatedDeclarations: true` (TypeScript 5.5+). Es el metodo mas rapido para emitir declaraciones de tipo sin el overhead del type-checking completo. Fomenta el uso de tipos explicitos en miembros exportados.

## Dependencies

- **Depende de**: Sprint 2 (plugin-system) - es un plugin que se registra en el sistema.
- **Dependientes**: Ninguno directamente, pero es consumido por el build-engine via plugin-system.

## Estructura del Modulo

```
modules/dts-emitter/
├── domain/
│   ├── entities/
│   │   ├── DeclarationFile.ts           # Representa un .d.ts generado
│   │   └── EmitterConfig.ts             # Config del emisor (outDir, rootDir, etc.)
│   ├── value-objects/
│   │   └── DeclarationPath.ts           # Ruta validada de output .d.ts
│   ├── ports/
│   │   └── TypeEmitter.port.ts          # Interface para emitir declaraciones
│   └── services/
│       └── DeclarationPathResolver.ts   # Resuelve rutas de output .d.ts
├── app/
│   └── use-cases/
│       ├── EmitDeclarationsUseCase.ts   # Orquesta la emision de .d.ts
│       └── CreateDtsPluginUseCase.ts    # Crea el BunPlugin listo para registrar
├── infra/
│   ├── adapters/
│   │   └── BunIsolatedDeclarationsAdapter.ts  # Usa TS compiler API con isolatedDeclarations
│   └── factories/
│       └── DtsEmitterFactory.ts
└── index.ts
```

## Pasos a Ejecutar

### Paso 1: Domain Layer
- [ ] Definir `DeclarationFile` entity (sourcePath, outputPath, content)
- [ ] Definir `EmitterConfig` entity (outDir, rootDir, include/exclude patterns)
- [ ] Implementar `DeclarationPath` VO
- [ ] Definir `TypeEmitterPort` interface
- [ ] Implementar `DeclarationPathResolver` domain service

### Paso 2: Application Layer
- [ ] Implementar `EmitDeclarationsUseCase` - coordina emision de todos los .d.ts
- [ ] Implementar `CreateDtsPluginUseCase` - retorna un BunPlugin compatible con el plugin-system

### Paso 3: Infrastructure Layer
- [ ] Investigar API de TypeScript para `isolatedDeclarations` en Bun
- [ ] Implementar `BunIsolatedDeclarationsAdapter` que usa `ts.transpileDeclaration` o equivalente
- [ ] Implementar `DtsEmitterFactory`

### Paso 4: Integracion como Plugin
- [ ] Registrar el dts-emitter como plugin interno disponible por defecto
- [ ] Integrar con `buildSetting()` via opcion `dts: true` o `dts: { ... }`
- [ ] Documentar API con JSDoc

### Paso 5: Tests
- [ ] Tests unitarios para DeclarationPathResolver
- [ ] Test de integracion: emitir .d.ts desde un modulo TypeScript simple
- [ ] Test E2E: buildSetting con dts habilitado genera .d.ts correctos
- [ ] Verificar que `isolatedDeclarations` rechaza tipos no explicitos

## Status

- [ ] Paso 1: Domain Layer
- [ ] Paso 2: Application Layer
- [ ] Paso 3: Infrastructure Layer
- [ ] Paso 4: Integracion como Plugin
- [ ] Paso 5: Tests
