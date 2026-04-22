import type { BunPlugin } from '../../../../shared/types/BunPlugin';
import type { PluginType } from '../value-objects/PluginType';
import type { PluginPhase } from '../value-objects/PluginPhase';

/**
 * Plugin definition — wraps a BunPlugin instance with orchestration metadata.
 */
export interface PluginDefinition {
	bunPlugin: BunPlugin;
	name: string;
	type: PluginType;
	phase: PluginPhase;
	priority: number;
}
