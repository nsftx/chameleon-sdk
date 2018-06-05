import wordpress from './wordpress';

describe('wordpress connector', () => {
  it('should have methods exposed', () => {
    expect(wordpress.getSources).toBeTruthy();
    expect(wordpress.getSourceSchema).toBeTruthy();
    expect(wordpress.getSourceData).toBeTruthy();
    expect(wordpress.changeSourceData).toBeTruthy();
  });
});
