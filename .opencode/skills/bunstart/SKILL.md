---
name: bunstart
description: Build and development toolchain for Bun monorepos with @bunstart/pack
---

# Skill: bunstart

Use this skill when working with bunstart CLI, @bunstart/pack, Bun monorepos, or bun-based TypeScript projects.

## When to Use

- Working with bunstart CLI commands (`buns`, `buns mono`)
- Configuring @bunstart/pack for builds and development
- Managing monorepo workspaces with bunstart
- Creating new apps or packages in a bunstart monorepo
- Migrating existing projects to use @bunstart/pack

## Critical Patterns

### CLI Commands

```bash
# Initialize a new monorepo
buns init

# Create a new app in monorepo
buns mono generate app my-app --template api-rest

# Build a workspace
buns mono build my-app

# Run dev server
buns mono dev my-app

# Run start script
buns mono start my-app

# Run any script in a workspace
buns my-app test

# Adopt an existing project (always applies pack)
buns mono adopt app my-app
buns mono adopt app my-app --from ../external-project

# Migrate existing workspace to pack
buns mono migrate-pack my-app

# Add workspace dependency
buns mono my-app add-dep other-package
```

### @bunstart/pack buildSetting() API

```typescript
import { buildSetting } from '@bunstart/pack';

// Basic backend/api setup
const { build, serve, watch } = buildSetting({
  entrypoints: ['src/index.ts'],
  outdir: 'dist',
  target: 'bun',
  format: 'esm',
  minify: false,
  sourcemap: false
});

// Frontend setup
const { build: frontendBuild } = buildSetting({
  entrypoints: ['src/index.html'],
  outdir: 'dist',
  target: 'browser',
  format: 'esm',
  minify: true,
  sourcemap: 'linked',
  plugins: [BunPluginTailwind]
});

// Library setup with DTS
const { build: libBuild } = buildSetting({
  entrypoints: ['src/index.ts'],
  outdir: 'dist',
  target: 'bun',
  format: 'esm',
  minify: false,
  // DTS is auto-enabled for libraries in templates
});

// Execute build
await build();

// Start dev server
const server = await serve({ port: 3000, hmr: true });

// Watch mode
const { server: watchServer, stop } = await watch({
  port: 3000,
  watchPaths: ['src']
});
```

### bunstart.config.ts Schema

```typescript
export default {
  pack: {
    // Wrapper mode (default after adopt)
    build: { script: 'bun run build' },
    dev: { script: 'bun run dev' },
    start: { script: 'bun run start' },
    
    // OR native pack config (agent can migrate to this)
    build: {
      entry: 'src/index.ts',
      outdir: 'dist',
      target: 'bun',
      format: 'esm'
    }
  },
  repo: {
    apps: {
      'my-app': { name: '@scope/my-app', dependsOn: [] }
    },
    packages: {
      'shared': { name: '@scope/shared', dependsOn: [] }
    }
  }
};
```

## Project Templates

### api-rest
Backend API with Bun.serve()
- Entry: `src/index.ts`
- Template creates bunstart.build.ts with buildSetting()

### frontend-react  
React SPA with Vite-style dev server
- Entry: `index.html` or `src/index.tsx`
- Includes bun-plugin-tailwind

### library
TypeScript library package
- Entry: `src/index.ts`
- Auto-generates .d.ts files

## Common Tasks

### Adding @bunstart/pack to an existing project

```bash
# Install dependency
bun add @bunstart/pack

# Create bunstart.build.ts
import { buildSetting } from '@bunstart/pack';

export async function build() {
  const { build: packBuild } = buildSetting({
    entrypoints: ['src/index.ts'],
    outdir: 'dist',
    target: 'bun',
    format: 'esm'
  });
  await packBuild();
}
```

### Creating a custom build script

```typescript
// bunstart.build.ts
import { buildSetting } from '@bunstart/pack';

export async function build(): Promise<void> {
  console.log('Building with @bunstart/pack...');
  
  const { build: packBuild } = buildSetting({
    entrypoints: ['src/index.ts'],
    outdir: 'dist',
    target: 'bun',
    format: 'esm',
    minify: true,
    external: ['some-heavy-dependency']
  });
  
  await packBuild();
  console.log('Build complete!');
}

if (import.meta.main) {
  build().catch(console.error);
}
```

## Troubleshooting

### "Cannot find module '@bunstart/pack'"
Run `bun install` in the workspace directory.

### "Workspace not found"
Ensure the workspace exists in `apps/` or `packages/` directory.

### "No bunstart.config.ts found"
Run commands from the monorepo root where bunstart.config.ts exists.

### Build fails with TypeScript errors
Ensure `typescript` is in devDependencies: `bun add -d typescript`

### Pack migration failed
Check that the workspace has a valid package.json with scripts defined.

## Resources

- Repository: https://github.com/leomerida15/bunstart
- NPM: @bunstart/cli, @bunstart/pack
- Documentation: See repo README.md
