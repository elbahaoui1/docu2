type LogMeta = Record<string, unknown> | undefined;

function format(message: string, meta?: LogMeta) {
  return meta ? `${message} ${JSON.stringify(meta)}` : message;
}

export const logger = {
  info(message: string, meta?: LogMeta) {
    // eslint-disable-next-line no-console
    console.log(format(message, meta));
  },
  warn(message: string, meta?: LogMeta) {
    // eslint-disable-next-line no-console
    console.warn(format(message, meta));
  },
  error(message: string, meta?: LogMeta) {
    // eslint-disable-next-line no-console
    console.error(format(message, meta));
  },
};


