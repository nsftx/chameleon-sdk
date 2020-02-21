class NativeMobileRunner {
  constructor(config, runnerName) {
    this.config = config;
    this.nativeRunner = window[runnerName];
  }
}

export default NativeMobileRunner;
