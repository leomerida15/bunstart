import { watch } from "node:fs";
import { resolve } from "node:path";
import { build } from "./bunpack.build";

/**
 * Watch script for the CLI package.
 * 
 * Execute this script using Bun CLI:
 *   bun run bunpack.watch.ts
 * 
 * Or via npm script:
 *   bun run dev
 * 
 * This script watches for changes in src/index.ts and automatically
 * rebuilds the project when changes are detected using the centralized
 * build function from bunpack.build.ts.
 */

/**
 * Main function to start the watch process.
 * 
 * @returns {Promise<void>}
 */
async function main(): Promise<void> {
    // Initial build
    console.log("🔨 Initial build...");
    await build();

    // Watch for changes
    const watchPath = resolve(process.cwd(), "src/index.ts");
    console.log(`👀 Watching for changes in ${watchPath}...`);
    
    let buildTimeout: ReturnType<typeof setTimeout> | null = null;
    
    const watcher = watch(watchPath, async (eventType: string, filename: string | null) => {
        if (eventType !== "change") return;
            // Debounce: wait 100ms before building to avoid multiple builds
            if (buildTimeout) {
                clearTimeout(buildTimeout);
            }
            
            buildTimeout = setTimeout(async () => {
                console.log(`\n📝 Change detected in ${filename || watchPath}`);
                try {
                    await build();
                } catch (error) {
                    // Error is already logged by build function
                }
            }, 100);
        
    });

    // Keep the process running
    process.on("SIGINT", () => {
        console.log("\n👋 Stopping watch...");
        watcher.close();
        if (buildTimeout) {
            clearTimeout(buildTimeout);
        }
        process.exit(0);
    });
}

// Start the watch process
main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});