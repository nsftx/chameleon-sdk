/* eslint no-prototype-builtins: "off" */

import { isNil } from 'lodash';
import logger from './logger';

const RUNNER_NAME = 'ChameleonRunner';

export default {
  /*
  Detects is app running inside runner device.
  Basic check is to check does ChameleonRunner global exist.
  TODO: Write fallback detection
  */
  detectRunner() {
    if (!window.hasOwnProperty(RUNNER_NAME)) {
      logger.error('ChameleonRunner not detected.');
      return false;
    }

    const runner = window[RUNNER_NAME];

    if (isNil(runner)) {
      logger.warning('ChameleonRunner detected but has nil value.');
      return false;
    }

    logger.info('ChameleonRunner detected.');
    return runner;
  },
};
