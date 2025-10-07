import winston from 'winston'

const logLevel = process.env.LOG_LEVEL || 'info'

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      service,
      message,
      ...meta
    })
  })
)

export function createLogger(service: string) {
  return winston.createLogger({
    level: logLevel,
    format: logFormat,
    defaultMeta: { service },
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      })
    ]
  })
}

export const logger = createLogger('railway-workers')
