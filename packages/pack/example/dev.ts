/**
 * Ejemplo de uso de @bunstart/pack
 * 
 * Este script demonstra cómo usar pack para:
 * - Compilar TypeScript → JavaScript
 * - Servir archivos estáticos
 * - Auto-rebuild en cambios de archivos
 * 
 * Usage:
 *   bun run example/dev.ts
 * 
 * Then open http://localhost:3000
 */

import { buildSetting } from "../src/index.ts";
import { existsSync, mkdirSync } from "node:fs";

const outdir = "./example/dist";
const root = "./example/public";

// Asegurar que existe el directorio de salida
if (!existsSync(outdir)) {
  mkdirSync(outdir, { recursive: true });
}

console.log("🚀 Iniciando @bunstart/pack demo...\n");

// Configuramos pack con nuestrosentrypoints
const { build, serve, watch } = buildSetting({
  entrypoints: ["./example/src/index.ts"],
  outdir,
  target: "browser",
  format: "esm",
  splitting: false,
  minify: false,
  sourcemap: true,
});

// Primera build
console.log("📦 Compilando inicial...");
await build();
console.log("✅ Build completado\n");

// Ahora iniciamos el servidor con watch
console.log("🔄 Iniciando watch mode...");
const handle = await watch({
  port: 3000,
  root,
  watchPaths: ["./example/src"],
  debounceMs: 150,
});

console.log(`🌐 Servidor corriendo en: http://localhost:3000`);
console.log("📝 Edita ./example/src/index.ts y guardá para ver los cambios");
console.log("\n🛑 Presiona Ctrl+C para detener\n");

// Manejo de señal de terminación
process.on("SIGINT", async () => {
  console.log("\n🧹 Cerrando servidor...");
  await handle.stop();
  process.exit(0);
});
