import winston from 'winston';

export const Logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'mogboard-next' },
  transports: [
    new winston.transports.Console({
      format: winston.format.printf(
        ({ level, message, location, ...meta }) =>
          `[${new Date().toISOString()}][${level}][${location}]: ${message} ${JSON.stringify(meta)}`
      ),
    }),
  ],
});
