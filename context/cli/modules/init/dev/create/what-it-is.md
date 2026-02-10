# Comando `create` — Especificación

## ¿Qué es?

`create` es un comando del CLI de bunstart que actúa como **wrapper inteligente** para crear proyectos. Centraliza la creación de aplicaciones y paquetes, detectando automáticamente el contexto (proyecto raíz o monorepo) y adaptando su comportamiento.

---

## Uso

```bash
bunstart create [template] [flags]
```

### Argumentos

- **`[template]`** (Opcional): Nombre de la plantilla para `bun create`.
  - Si se proporciona (ej. `react`, `next-app`), delega la creación a `bun create [template]`.
  - Si **NO** se proporciona, inicia el modo interactivo para usar los templates internos de bunstart (vía `init`).

### Flags (Opciones)

- **`--skip-build`**: Omite la generación de los scripts de construcción (`bunstart.build.ts` y `bunstart.watch.ts`). Útil para proyectos que ya tienen su propio sistema de build (Next.js, Vite, etc.).
- **`--yes`**, **`-y`**: Salta los prompts interactivos, asumiendo "Sí" a las confirmaciones (como generar scripts de build, salvo que se use `--skip-build`).

---

## Comportamiento por Contexto

El comando es **agnóstico al contexto**. Detecta si está en un monorepo buscando `bunstart.config.ts` en el directorio actual o ancestros.

### 1. Modo Interactivo (Sin Argumento)

```bash
bunstart create
```

1.  **Solicita Nombre**: Pregunta el nombre del proyecto.
2.  **Crea Carpeta**: Genera el directorio del proyecto.
3.  **Scaffolding**: Ejecuta el comando `init` internamente (usando templates de bunstart).
4.  **Genera `package.json`**: Asegura que exista un `package.json` básico si el template no lo proveyó.
5.  **Detección Monorepo**:
    -   **Si es Monorepo**: Ejecuta automáticamente `adopt` para registrar el nuevo proyecto en el `package.json` raíz y configurar alias.
    -   **Si es Standalone**: Finaliza la creación.

### 2. Modo Delegado (Con Argumento)

```bash
bunstart create next-app
```

1.  **Delega**: Ejecuta `bun create next-app` (nativo de Bun).
2.  **Detección Monorepo**:
    -   **Si es Monorepo**: Pregunta si se desean generar los scripts de build (o usa flags `--yes`/`--skip-build`) y ejecuta `adopt`.
    -   **Si es Standalone**: Finaliza.

---

## Flags y Automatización

| Flag | Efecto en `create` | Efecto en `adopt` (automático) |
| :--- | :--- | :--- |
| **(ninguno)** | Pregunta nombre y confirmación de scripts. | Pregunta confirmación si no se ha hecho antes. |
| **`--skip-build`** | No pregunta por scripts. No los genera. | Pasa `--skip-build` a `adopt`. |
| **`--yes` / `-y`** | No pregunta nombre (falla si no se infiere). | Pasa confirmación automática. Genera build scripts por defecto. |

---

## Flujos completos

### Flujo 1: `bunstart create` (proyecto raíz)
1.  **Prompt**: "¿Nombre del proyecto?" -> Usuario: `my-app`
2.  **Acción**: Crea `./my-app` con template básico.
3.  **Prompt**: "¿Generar bunstart.build.ts?" -> Usuario: `Y`
4.  **Resultado**: Proyecto creado con scripts de build.

### Flujo 2: `bunstart create` (en monorepo)
1.  **Prompt**: "¿Nombre del proyecto?" -> Usuario: `apps/my-app`
2.  **Acción**: Crea `./apps/my-app`.
3.  **Auto-Adopción**: Detecta monorepo. Ejecuta `adopt`.
4.  **Resultado**: Proyecto creado, `package.json` raíz actualizado (workspaces), scripts generados.

### Flujo 3: `bunstart create react` (con flag)
```bash
bunstart create react --yes --skip-build
```
1.  **Acción**: Ejecuta `bun create react`.
2.  **Auto-Adopción** (si aplica): Ejecuta `adopt` pasando `--skip-build` (sin prompts).
3.  **Resultado**: Proyecto React creado, sin scripts de bunstart adicionales, integrado en monorepo si corresponde.
