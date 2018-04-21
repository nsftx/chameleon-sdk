const colors = {
  log: '#41b883',
  info: '#41b883',
  warn: '#ffa500',
  error: '#b20000',
};

const formatLog = (level, message, data, moduleName) => {
  const suffix = moduleName || 'SDK';

  /* eslint no-console: "off" */
  return console.log(
    `%c Chameleon ${suffix} %c ${message} %c`,
    'background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff',
    `background:${colors[level]} ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff`,
    'background:transparent',
    data,
  );
};

export default {
  log(message, data, suffix) {
    formatLog('log', message, data, suffix);
  },
  info(message, data, suffix) {
    formatLog('info', message, data, suffix);
  },
  warn(message, data, suffix) {
    formatLog('warn', message, data, suffix);
  },
  error(message, data, suffix) {
    formatLog('error', message, data, suffix);
  },
};
