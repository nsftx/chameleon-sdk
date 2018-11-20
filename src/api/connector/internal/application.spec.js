/* eslint import/no-unresolved:"off" */
import axiosMock from 'axios';
import sourceSchemaMock from 'data/application-source-schema.json';
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

  it('should get sources', (done) => {
    axiosMock.get.mockImplementation(() => Promise.resolve({
      data: connectorInstanceMock.sources,
    }));


    application.getSources(connectorInstanceMock).then((result) => {
      expect(result).toEqual(connectorInstanceMock.sources);
      done();
    });
  });

  it('should get source schema', (done) => {
    axiosMock.get.mockImplementation(() => Promise.resolve({
      data: sourceSchemaMock,
    }));

    const sourceMock = {
      name: 'pages',
    };

    application.getSourceSchema(connectorInstanceMock, sourceMock).then((result) => {
      expect(result).toEqual(sourceSchemaMock);
      done();
    });
  });
  //
  // it('should get source data', (done) => {
  //   axiosMock.get.mockImplementation(() => Promise.resolve({
  //     data: sourceDataMock.seedResponse,
  //   }));
  //
  //   const options = {
  //     seed: true,
  //     params: {
  //       pageSize: 15,
  //     },
  //   };
  //
  //   rest.getSourceData(connectorMock, sourceMock, options).then((result) => {
  //     expect(result).toEqual(sourceDataMock.seedResult);
  //     done();
  //   });
  // });
});
