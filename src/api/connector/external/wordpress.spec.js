import axiosMock from 'axios';
import postsMock from '../../../../test/__data__/posts.json';
import wordpress from './wordpress';

const connectorMock = {
  name: 'wordpress',
  type: 'rest',
  disabled: false,
  options: {
    endpoint: null,
  },
};

describe('wordpress connector', () => {
  it('should have methods exposed', () => {
    expect(wordpress.getSources).toBeTruthy();
    expect(wordpress.getSourceSchema).toBeTruthy();
    expect(wordpress.getSourceData).toBeTruthy();
    expect(wordpress.changeSourceData).toBeTruthy();
  });

  it('should get POSTS data', (done) => {
    axiosMock.get.mockImplementation(() => Promise.resolve({
      data: postsMock,
    }));

    const options = {};

    wordpress.getSourceData(connectorMock, {
      name: 'posts',
    }, options).then((result) => {
      expect(result).toEqual(postsMock);
      done();
    });
  });
});
