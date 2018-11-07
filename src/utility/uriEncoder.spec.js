import uriEncoder from './uriEncoder';

describe('Uri encoder utility', () => {
  it('', () => {
    const params = {
      numRecords: 10,
      schema: '{"name":"test","schema":[{"name":"address","type":"text"},{"name":"name","type":"text"}]}',
    };

    const result = uriEncoder.encode(params);
    const expected = 'numRecords=10&schema=%7B%22name%22%3A%22test%22%2C%22schema%22%3A%5B%7B%22name%22%3A%22address%22%2C%22type%22%3A%22text%22%7D%2C%7B%22name%22%3A%22name%22%2C%22type%22%3A%22text%22%7D%5D%7D';

    expect(result).toEqual(expected);
  });
});
