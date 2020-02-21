import { v4 } from 'uuid';
import detection from './detection';

class RunnerClient {
  constructor(config = {}) {
    this.uuid = v4();
    this.runnerInstance = {};

    if (config.immediateDetection) this.detect();
  }

  detect() {
    this.runnerInstance = detection.detectRunner();
    console.log(this.runnerInstance);
  }
}

export default RunnerClient;
