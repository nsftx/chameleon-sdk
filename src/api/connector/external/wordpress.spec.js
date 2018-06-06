/* eslint import/no-unresolved:"off" */
import axiosMock from 'axios';
import sourcesMock from 'data/wordpress-sources.json';
import postsSchemaMock from 'data/wordpress-posts-schema.json';
import postsMock from 'data/wordpress-posts.json';
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
    const compareType = 'function';
    expect(typeof wordpress.getSources).toEqual(compareType);
    expect(typeof wordpress.getSourceSchema).toEqual(compareType);
    expect(typeof wordpress.getSourceData).toEqual(compareType);
    expect(typeof wordpress.changeSourceData).toEqual(compareType);
  });

  it('should get sources', (done) => {
    axiosMock.get.mockImplementation(() => Promise.resolve({
      data: sourcesMock,
    }));

    const options = {};
    wordpress.getSources(connectorMock, options).then((result) => {
      expect(result).toEqual(sourcesMock.sources);
      done();
    });
  });

  it('should get posts schema', (done) => {
    axiosMock.get.mockImplementation(() => Promise.resolve({
      data: postsSchemaMock,
    }));

    const options = {};
    wordpress.getSourceSchema(connectorMock, options).then((result) => {
      expect(result).toEqual(postsSchemaMock);
      done();
    });
  });

  it('should get posts data', (done) => {
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
