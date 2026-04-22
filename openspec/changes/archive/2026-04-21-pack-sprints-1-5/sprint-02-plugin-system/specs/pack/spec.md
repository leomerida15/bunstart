# Spec: sprint-02-plugin-system

## Requirements

### Requirement: Plugin Registry

Sistema de registro de plugins.

**Given** usuario registra un plugin
**When** llama a registry.register(plugin)
**Then** el plugin queda disponible para ejecución

### Requirement: Plugin Resolution

Resolución de plugins por tipo.

**Given** se necesita un plugin de cierto tipo
**When** llama a registry.resolve(type)
**Then** retorna el plugin registrado

### Requirement: PluginType Extension

Extensión de PluginType para incluir "dts".

**Given** usuario quiere usar plugin dts
**When** tipo = "dts"
**Then** es válido y se resuelve correctamente

## Scenarios

| ID | Scenario | Expected |
|----|----------|----------|
| 1 | Registrar plugin válido | Registro exitoso |
| 2 | Resolver plugin existente | Retorna plugin |
| 3 | Usar tipo "dts" | Resuelve correctamente |