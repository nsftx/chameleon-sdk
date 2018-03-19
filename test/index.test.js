import sdk from '../src';

test('exposes sdk methods', () => {
  console.log(sdk);
  expect(sdk).toBeTruthy();
});
