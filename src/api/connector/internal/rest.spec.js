/* eslint import/no-unresolved:"off" */
import axiosMock from 'axios';
import sourceSchemaMock from 'data/ride-source-schema.json';
import sourceDataMock from 'data/ride-source-data.json';
import rest from './rest';

const connectorMock = {
  id: '1234',
  name: 'Test Ride',
  options: {
    space: null,
  },
  type: {
    name: 'ride',
    type: 'internalRest',
    disabled: false,
    options: {
      endpoint: {
        blueprint: null,
        write: null,
        read: null,
      },
    },
  },
};

const sourceMock = {
  id: 'c98a699b-5c14-4211-ae8c-7a6306ebfa13',
  record: '5059bdd6-2bda-4ccc-9bdd-7106cb705b2c',
  name: 'Test (Default)',
};

describe('internal rest connector', () => {
  it('should get source schema', (done) => {
    axiosMock.get.mockImplementation(() => Promise.resolve({
      data: sourceSchemaMock.response,
    }));

    rest.getSourceSchema(connectorMock, sourceMock).then((result) => {
      expect(result).toEqual(sourceSchemaMock.result);
      done();
    });
  });

  it('should get seed source data', (done) => {
    axiosMock.get.mockImplementation(() => Promise.resolve({
      data: sourceDataMock.seedResponse,
    }));

    const options = {
      seed: true,
      params: {
        pageSize: 15,
      },
    };

    rest.getSourceData(connectorMock, sourceMock, options).then((result) => {
      expect(result).toEqual(sourceDataMock.seedResult);
      done();
    });
  });

  it('should get source data', (done) => {
    axiosMock.get.mockImplementation(() => Promise.resolve({
      data: sourceDataMock.seedResponse,
    }));

    const options = {};

    rest.getSourceData(connectorMock, sourceMock, options).then((result) => {
      const expectedResult = expect.objectContaining({
        [sourceMock.name]: expect.objectContaining({
          items: expect.any(Array),
          pagination: expect.any(Object),
        }),
      });

      expect(result).toEqual(expectedResult);
      done();
    });
  });
});
