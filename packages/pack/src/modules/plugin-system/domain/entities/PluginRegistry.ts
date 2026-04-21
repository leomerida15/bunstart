import type { PluginDefinition } from './PluginDefinition';
import type { PluginPhase } from '../value-objects/PluginPhase';

/**
 * Registry for storing and retrieving plugins with metadata.
 */
export class PluginRegistry {
	private readonly plugins = new Map<string, PluginDefinition>();

	/**
	 * Add a plugin to the registry.
	 * If a plugin with the same name exists, it will be replaced.
	 */
	public add(def: PluginDefinition): void {
		this.plugins.set(def.name, def);
	}

	/**
	 * Get a plugin by name.
	 */
	public get(name: string): PluginDefinition | undefined {
		return this.plugins.get(name);
	}

	/**
	 * Get all plugins for a given phase, ordered by priority ascending.
	 */
	public getByPhase(phase: PluginPhase): PluginDefinition[] {
		const result: PluginDefinition[] = [];
		for (const def of this.plugins.values()) {
			if (def.phase.equals(phase)) {
				result.push(def);
			}
		}
		// Sort by priority ascending (lower runs first)
		result.sort((a, b) => a.priority - b.priority);
		return result;
	}

	/**
	 * Get all registered plugins.
	 */
	public getAll(): PluginDefinition[] {
		return Array.from(this.plugins.values());
	}

	/**
	 * Check if a plugin exists.
	 */
	public has(name: string): boolean {
		return this.plugins.has(name);
	}

	/**
	 * Remove a plugin by name.
	 */
	public remove(name: string): boolean {
		return this.plugins.delete(name);
	}

	/**
	 * Clear all plugins.
	 */
	public clear(): void {
		this.plugins.clear();
	}
}
