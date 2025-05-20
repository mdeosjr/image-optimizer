import pino from 'pino';

const transport = pino.transport({
  target: 'pino-pretty',
  options: {
    colorize: true,
    translateTime: 'SYS:dd-mm-yyyy HH:MM:ss',
    ignore: 'pid,hostname',
  },
});

const logLevel = (NODE_ENV: string | undefined) => {
  switch (NODE_ENV) {
    case 'development':
      return 'debug';
    case 'test':
      return 'silent';
    default:
      return 'info';
  }
};

const logger = pino(
  {
    level: logLevel(process.env.NODE_ENV),
    base: undefined,
  },
  transport
);

export default logger;
