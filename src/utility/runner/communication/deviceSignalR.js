class DeviceSignalRRunner {
  constructor(config) {
    this.config = config;
    this.detected = true;
    this.valid = true;
    this.options = config.options;
  }
}

export default DeviceSignalRRunner;
