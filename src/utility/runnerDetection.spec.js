/* eslint max-len: "off" */
import runnerDetection from './runnerDetection';
import { SERVFAIL } from 'dns';

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

  it('should handle options from query string', () => {
    global.window = Object.create(window);
    const url = 'http://localhost:8080/';
    const search = 'options=%7B%22endpoint%22%3A%22http%3A%2F%2Flocalhost%3A3000%22%7D';
    Object.defineProperty(window, 'location', {
      value: {
        href: url,
        search,
      },
    });

    const expectedOptions = {
      endpoint: 'http://localhost:3000',
    };

    const runner = runnerDetection.detectRunner();
    expect(runner.detected).toBeTruthy();
    expect(runner.valid).toBeTruthy();
    expect(runner.options).toMatchObject(expectedOptions);
  });
});
