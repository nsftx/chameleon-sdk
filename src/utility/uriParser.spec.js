import uriParser from './uriParser';

describe('Uri parser utility', () => {
  it('should properly encode uri string', () => {
    const params = {
      numRecords: 10,
      schema: '{"name":"test","schema":[{"name":"address","type":"text"},{"name":"name","type":"text"}]}',
    };

    const result = uriParser.encode(params);
    const expected = 'numRecords=10&schema=%7B%22name%22%3A%22test%22%2C%22schema%22%3A%5B%7B%22name%22%3A%22address%22%2C%22type%22%3A%22text%22%7D%2C%7B%22name%22%3A%22name%22%2C%22type%22%3A%22text%22%7D%5D%7D';

    expect(result).toEqual(expected);
  });

  it('should properly handle encoding multi-value query params', () => {
    const params = {
      key1: 'value1',
      key2: [
        'value2',
        'value3',
      ],
      key3: 'value4,withcomma',
    };

    const result = uriParser.encode(params);
    const expected = 'key1=value1&key2=value2&key2=value3&key3=value4%2Cwithcomma';

    expect(result).toEqual(expected);
  });

  it('should properly join url base and parts without passed slashes', () => {
    const result = uriParser.joinUrl('https://example.com', 'api');
    const expected = 'https://example.com/api';

    expect(result).toEqual(expected);
  });

  it('should properly join url base and parts with passed slashes', () => {
    const result = uriParser.joinUrl('https://example.com/', '/api');
    const expected = 'https://example.com/api';

    expect(result).toEqual(expected);
  });

  it('should properly join url base and multiple path parts w/ or w/o slashes', () => {
    const result = uriParser.joinUrl('https://example.com/', '/api', 'sources');
    const expected = 'https://example.com/api/sources';

    expect(result).toEqual(expected);
  });
});
