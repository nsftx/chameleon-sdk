/* eslint import/no-unresolved:"off" */
import axiosMock from 'axios';
import sourcesMock from 'data/generic-http-sources.json';
import sourceSchemaMock from 'data/generic-http-source-schema.json';
import sourceDataMock from 'data/generic-http-source-data.json';
import rest from './rest';

const connectorMock = {
  id: '5be410c46c11150026a97e4b',
  name: 'DataConnector',
  options: {
    endpoint: null,
  },
  type: {
    name: 'genericHttp',
    type: 'rest',
    options: {
      endpoint: null,
    },
  },
};

describe('rest connector', () => {
  it('should have methods exposed', () => {
    const compareType = 'function';
    expect(typeof rest.getSources).toEqual(compareType);
    expect(typeof rest.getSourceSchema).toEqual(compareType);
    expect(typeof rest.getSourceData).toEqual(compareType);
    expect(typeof rest.changeSourceData).toEqual(compareType);
  });

  it('should get sources', (done) => {
    axiosMock.get.mockImplementation(() => Promise.resolve({
      data: sourcesMock,
    }));

    const options = {};
    rest.getSources(connectorMock, options).then((result) => {
      expect(result).toEqual(sourcesMock.sources);
      done();
    });
  });

  it('should get source schema', (done) => {
    axiosMock.get.mockImplementation(() => Promise.resolve({
      data: sourceSchemaMock,
    }));

    const source = {
      name: 'articles',
    };
    rest.getSourceSchema(connectorMock, source).then((result) => {
      expect(result).toEqual(sourceSchemaMock);
      done();
    });
  });

  it('should get source data', (done) => {
    axiosMock.get.mockImplementation(() => Promise.resolve({
      data: sourceDataMock,
    }));

    const source = {
      name: 'articles',
    };
    rest.getSourceData(connectorMock, source).then((result) => {
      expect(result).toEqual(sourceDataMock);
      done();
    });
  });
});
