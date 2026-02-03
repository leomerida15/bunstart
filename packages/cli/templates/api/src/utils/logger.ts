import pino from 'pino';

export const logger = pino({
	name: 'api',
	level: 'info',
	transport: {
		target: 'pino-pretty',
		options: {
			colorize: true,
			ignore: 'pid,hostname',
			translateTime: 'SYS:dd-mm-yyyy HH:MM:ss',
		},
	},
});
