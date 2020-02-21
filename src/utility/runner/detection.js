/* eslint no-prototype-builtins: "off" */

import { isNil } from 'lodash';
import logger from '../logger';
import DeviceSignalRunner from './communication/deviceSignalR';
import NativeMobile from './communication/nativeMobile';

const RUNNER_NAME = 'ChameleonRunner';

const validateRunner = runner => typeof runner.sendMessage === 'function';

const handleRunnerOptions = () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (!urlParams.has('options')) {
    return false;
  }

  const options = JSON.parse(urlParams.get('options'));
  options.os = urlParams.get('os');

  return options;
};

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

    if (window.location.search) {
      const options = handleRunnerOptions();

      // If options are present, don't validate further
      if (options) {
        runnerDetection.detected = true;
        runnerDetection.valid = true;
        runnerDetection.options = options;

        return new DeviceSignalRunner(runnerDetection);
      }
    }

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

    return new NativeMobile(runnerDetection, RUNNER_NAME);
  },
};
