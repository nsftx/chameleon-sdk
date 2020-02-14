import { v4 } from 'uuid';

class RunnerClient {
  constructor() {
    this.uuid = v4();
    this.runnerInstance = {};
  }

  detect() {
    console.log(this.uuid);
  }
}

export default RunnerClient;
