import runnerDetection from './runnerDetection';

describe('Runner detection utility', () => {
  beforeEach(() => {
    delete global.ChameleonRunner;
  });

  it('should detect global ChameleonRunner variable', () => {
    global.ChameleonRunner = {
      sendMessage: () => {},
    };

    const runner = runnerDetection.detectRunner();
    expect(runner.detected).toBeTruthy();
    expect(runner.valid).toBeTruthy();
  });

  it('should have detected flag set to false when global ChameleonRunner variable is not defined', () => {
    const runner = runnerDetection.detectRunner();
    expect(runner.detected).toBeFalsy();
  });

  it('should have valid flag set to false when global ChameleonRunner variable does not have sendMessage method', () => {
    global.ChameleonRunner = {};

    const runner = runnerDetection.detectRunner();
    expect(runner.detected).toBeTruthy();
    expect(runner.valid).toBeFalsy();
  });

  it('should have valid flag set to false when global ChameleonRunner variable has nullish value', () => {
    global.ChameleonRunner = null;

    const runner = runnerDetection.detectRunner();
    expect(runner.detected).toBeTruthy();
    expect(runner.valid).toBeFalsy();
  });
});
