import { MonoCommand } from '../../command/mono/mono';

/**
 * Factory for creating MonoCommand instances with proper dependency injection.
 *
 * Following the Hexagonal Architecture and SOLID principles, this factory
 * handles the instantiation and wiring of the MonoCommand and its use cases.
 *
 * @class MonoCommandFactory
 */
export class MonoCommandFactory {
	/**
	 * Creates a new MonoCommand instance.
	 *
	 * @static
	 * @returns {MonoCommand} A fully configured MonoCommand instance
	 */
	public static create(): MonoCommand {
		// Future: Inyectar casos de uso (ListWorkspaces, RunScript, etc.)
		return new MonoCommand();
	}
}
