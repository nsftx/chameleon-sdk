/* eslint no-underscore-dangle:"off" */
import { startsWith } from 'lodash';
import logger from './logger';

describe('logger utility', () => {
  it('should have methods exposed', () => {
    const compareType = 'function';
    expect(typeof logger.log).toEqual(compareType);
    expect(typeof logger.info).toEqual(compareType);
    expect(typeof logger.warn).toEqual(compareType);
    expect(typeof logger.error).toEqual(compareType);
  });

  it('should call log method', () => {
    logger.log('Log', null, 'Namespace');
    const { message } = console._buffer[0];
    expect(startsWith(message, '%c Chameleon Namespace %c Log %c background:#35495e'));
  });

  it('should call info method', () => {
    logger.info('Info', { test: true });
    const { message } = console._buffer[0];
    expect(startsWith(message, '%c Chameleon SDK %c Info %c background:#41b883'));
  });

  it('should call warn method', () => {
    logger.warn('Warn');
    const { message } = console._buffer[0];
    expect(startsWith(message, '%c Chameleon SDK %c Warn %c background:#ffa500'));
  });

  it('should call error method', () => {
    logger.error('Error');
    const { message } = console._buffer[0];
    expect(startsWith(message, '%c Chameleon SDK %c Error %c background:#b20000'));
  });
});
