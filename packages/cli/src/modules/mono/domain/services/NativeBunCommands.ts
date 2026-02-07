const NATIVE_BUN_COMMANDS = new Set([
	'add',
	'a',
	'install',
	'remove',
	'rm',
	'r',
	'x',
	'link',
	'unlink',
	'pm',
	'outdated',
	'update',
	'create'
]);

export function isNativeBunCommand(cmd: string): boolean {
	return NATIVE_BUN_COMMANDS.has(cmd);
}
