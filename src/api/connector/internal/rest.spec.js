/* eslint import/no-unresolved:"off" */
import axiosMock from 'axios';
import sourcesMock from 'data/ride-sources.json';
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
  name: 'Test (Default)',
  meta: {
    record: '5059bdd6-2bda-4ccc-9bdd-7106cb705b2c',
  },
  filters: [
    {},
  ],
  schema: [
    {
      displayFieldId: 'a3a0ed17-0292-41ab-8485-3d77c7919e79',
      displayName: 'name',
      id: '7142243f-5de5-4a6a-ad0f-e33c4ec1c09e',
      mapName: 'field-1',
      mapType: null,
      mask: null,
      name: 'name',
      recordId: 'cf758676-bf3d-40bc-9214-166c48284c13',
      title: null,
      type: 'text',
    },
    {
      displayFieldId: '3c14b367-47c2-4d8f-a52e-2e5f2c4d9cbd',
      displayName: 'address',
      id: '14a1ca2a-3985-4ec9-9a97-b5f96e527a3d',
      mapName: 'field-2',
      mapType: null,
      mask: null,
      name: 'address',
      recordId: 'cf758676-bf3d-40bc-9214-166c48284c13',
      title: null,
      type: 'text',
    },
  ],
};

describe('internal rest connector', () => {
  it('should get sources', (done) => {
    axiosMock.get.mockImplementation(() => Promise.resolve({
      data: sourcesMock.response,
    }));

    const options = {
      pagination: {
        page: 1,
        size: 10,
      },
    };

    rest.getSources(connectorMock, options).then((result) => {
      expect(result).toEqual(sourcesMock.result);
      done();
    });
  });

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

  it('should create new source record instance', (done) => {
    axiosMock.post.mockImplementation(() => Promise.resolve({
      data: { recordInstanceId: 'b086fb68-6805-46d2-838a-4d1c10862a00' },
    }));

    const options = {
      payload: {
        'field-1': 'Borg',
        'field-2': 'The Cube',
      },
    };

    rest.changeSourceData(connectorMock, sourceMock, options).then((result) => {
      const expectedResult = expect.objectContaining({
        'field-1': 'Borg',
        'field-2': 'The Cube',
        id: expect.any(String),
      });

      expect(result).toEqual(expectedResult);
      done();
    });
  });
});
