/* eslint no-prototype-builtins: "off" */

import { assign, isNil } from 'lodash';
import logger from './logger';

const RUNNER_NAME = 'ChameleonRunner';

const validateRunner = runner => typeof runner.sendMessage === 'function';

export default {
  /*
  Detects is app running inside runner device.
  Basic check is to check does ChameleonRunner global exist.
  */
  detectRunner() {
    const runnerDetection = {
      detected: false,
      valid: false,
    };

    if (!window.hasOwnProperty(RUNNER_NAME)) {
      logger.error('ChameleonRunner not detected.');
      return runnerDetection;
    }

    const runner = window[RUNNER_NAME];
    runnerDetection.detected = true;

    if (isNil(runner)) {
      logger.warn('ChameleonRunner detected but has nullish value.', runner);
      return runnerDetection;
    }

    if (!validateRunner(runner)) {
      logger.warn('ChameleonRunner detected but is missing sendMessage method.', runner);
      return runnerDetection;
    }

    logger.info('ChameleonRunner detected.', runner);
    runnerDetection.valid = true;
    assign(runner, runnerDetection);

    return runner;
  },
};
