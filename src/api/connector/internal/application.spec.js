/* eslint import/no-unresolved:"off" */
import axiosMock from 'axios';
import sourceSchemaMock from 'data/application-source-schema.json';
import sourceDataMock from 'data/application-source-data.json';
import sourceRegistryMock from 'data/application-source-registry.json';
import application from './application';

const connectorInstanceMock = {
  global: true,
  id: 'application',
  name: 'Application',
  type: 'internalApplication',
  options: {},
  sources: {
    currentApp: {
      name: 'currentApp',
      model: 'CurrentApp',
    },
    currentUser: {
      name: 'currentUser',
      model: 'CurrentUser',
    },
    pages: {
      name: 'pages',
      model: 'Page',
    },
    themes: {
      name: 'themes',
      model: 'Theme',
    },
  },
};


describe('application connector', () => {
  it('should have methods exposed', () => {
    const compareType = 'function';
    expect(typeof application.getSources).toEqual(compareType);
    expect(typeof application.getSourceSchema).toEqual(compareType);
    expect(typeof application.getSourceData).toEqual(compareType);
  });

  it('should get sources', async (done) => {
    axiosMock.get.mockImplementation(() => Promise.resolve({
      data: connectorInstanceMock.sources,
    }));

    const result = await application.getSources(connectorInstanceMock);

    expect(result).toEqual(connectorInstanceMock.sources);
    done();
  });

  it('should get source schema', async (done) => {
    axiosMock.get.mockImplementation(() => Promise.resolve({
      data: sourceSchemaMock,
    }));

    const sourceMock = {
      name: 'pages',
    };

    const result = await application.getSourceSchema(connectorInstanceMock, sourceMock);

    expect(result).toEqual(sourceSchemaMock);
    done();
  });

  it('should get source data from registry', async (done) => {
    axiosMock.get.mockImplementation(() => Promise.resolve({
      data: sourceDataMock,
    }));

    const sourceMock = {
      name: 'pages',
    };

    const result = await application.getSourceData(connectorInstanceMock, sourceMock, {
      context: {
        registry: sourceRegistryMock,
      },
    });

    expect(result).toEqual(sourceDataMock);
    done();
  });

  it('should reject get source schema action if source name non-existent', async () => {
    axiosMock.get.mockImplementation(() => Promise.resolve({
      data: sourceDataMock,
    }));

    const sourceMock = {
      name: 'someInvalidSource',
    };

    await expect(application.getSourceSchema(connectorInstanceMock, sourceMock))
      .rejects.toThrow('Non-existent source schema');
  });

  it('should reject get source data action if source name non-existent', async () => {
    axiosMock.get.mockImplementation(() => Promise.resolve({
      data: sourceDataMock,
    }));

    const sourceMock = {
      name: 'someInvalidSource',
    };
    const optionsMock = {
      context: {
        registry: sourceRegistryMock,
      },
    };

    await expect(application.getSourceData(connectorInstanceMock, sourceMock, optionsMock))
      .rejects.toThrow('Non-existent source schema or meta');
  });
});
