const winston = require('winston');

const isProd = process.env.NODE_ENV === 'production';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level}: ${message}${metaString}`;
  }),
);

const logger = winston.createLogger({
  level: isProd ? 'info' : 'debug',
  format: isProd ? logFormat : devFormat,
  defaultMeta: {
    service: 'gips-backend',
  },
  transports: [new winston.transports.Console()],
});

module.exports = logger;
