# Spec: sprint-03-dts-emitter

## Requirements

### Requirement: DtsEmitter Service

Generador de declaraciones TypeScript.

**Given** archivos TS compilados
**When** DtsEmitter.generate(inputFiles)
**Then** genera archivos .d.ts correspondientes

### Requirement: BunPluginDtsAdapter

Adapter que integra bun-plugin-dts.

**Given** se necesita generar .d.ts
**When** BunPluginDtsAdapter.execute()
**Then** ejecuta plugin y retorna archivos generados

### Requirement: Isolated Declarations

Soporte para TS 5.5+ isolatedDeclarations.

**Given** config con isolatedDeclarations: true
**When** se ejecuta dts-emitter
**Then** usa modo isolated

## Scenarios

| ID | Scenario | Expected |
|----|----------|----------|
| 1 | Generar .d.ts simple | Archivo creado |
| 2 | Generar con isolated | Modo isolated usado |
| 3 | Archivo sin exports | Archivo vacío o skip |

## Pending

⚠️ BunPluginDtsAdapter es placeholder - integración real pendiente