import type { BunPlugin } from '../../../../shared/types/BunPlugin';
import { PluginType } from '../../domain/value-objects/PluginType';
import { PluginPhase } from '../../domain/value-objects/PluginPhase';
import type { PluginDefinition } from '../../domain/entities/PluginDefinition';
import { PluginRegistry } from '../../domain/entities/PluginRegistry';
import { PluginValidator } from '../../domain/services/PluginValidator';

export interface RegisterPluginInput {
	bunPlugin: BunPlugin;
	type: 'internal' | 'external';
	phase: 'pre-build' | 'build' | 'post-build';
	priority: number;
}

/**
 * Use case for registering a plugin in the registry.
 */
export class RegisterPluginUseCase {
	constructor(
		private readonly registry: PluginRegistry,
		private readonly validator: PluginValidator = new PluginValidator(),
	) {}

	/**
	 * Execute the use case to register a plugin.
	 */
	public execute(input: RegisterPluginInput): void {
		// Validate the BunPlugin shape
		this.validator.validate(input.bunPlugin);

		// Create the plugin definition
		const definition: PluginDefinition = {
			bunPlugin: input.bunPlugin,
			name: input.bunPlugin.name,
			type: PluginType.fromString(input.type),
			phase: PluginPhase.fromString(input.phase),
			priority: input.priority,
		};

		// Add to registry (replaces existing if duplicate name)
		this.registry.add(definition);
	}
}
