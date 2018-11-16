import application from './application';

describe('application connector', () => {
  it('should have methods exposed', () => {
    const compareType = 'function';
    expect(typeof application.getSources).toEqual(compareType);
    expect(typeof application.getSourceSchema).toEqual(compareType);
    expect(typeof application.getSourceData).toEqual(compareType);
  });
});
