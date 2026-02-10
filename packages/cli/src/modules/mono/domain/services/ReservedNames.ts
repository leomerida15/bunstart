const RESERVED_NAMES = new Set([
	'generate',
	'gen',
	'build',
	'dev',
	'start',
	'sync',
	'remove',
	'adopt',
	'add-dep',
	'a-dep',
	'remove-dep',
	'rm-dep',
	'r-dep',
	'add',
	'a',
	'install',
	'rm',
	'r',
	'init',
	'mono',
	'pm',
	'x',
	'create',
	'link',
	'unlink',
	'outdated',
	'update',
	'run',
	'help',
	'--help',
	'-h',
	'--version',
	'-v'
]);

export function isReserved(name: string): boolean {
	return RESERVED_NAMES.has(name);
}
