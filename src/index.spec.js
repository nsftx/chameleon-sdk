import sdk from './index';

describe('library', () => {
  it('should expose library', () => {
    expect(sdk).toBeTruthy();
  });

  it('should expose api module', () => {
    expect(sdk.api).toBeTruthy();
  });

  it('should expose utility module', () => {
    expect(sdk.utility).toBeTruthy();
  });

  it('should expose mixins module', () => {
    expect(sdk.mixins).toBeTruthy();
  });
});
