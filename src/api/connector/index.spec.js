/*
TODO: Mock api call.
Do not call external http endpoint.
*/
import connector from './index';

const connectorMock = {
  name: 'local',
  type: 'internalLocal',
  description: 'Local Connector',
  disabled: false,
  options: {
    endpoint: 'https://chameleon.nsoft.com/static/data',
  },
  sources: {
    populationPerAge: {
      name: 'populationPerAge',
      model: 'PopulationPerAge',
    },
  },
};

describe('connector', () => {
  it('should get sources', (done) => {
    connector.getSources(connectorMock).then((result) => {
      done();
      expect(result).toBeTruthy();
    });
  });

  it('should get source schema', (done) => {
    const source = connectorMock.sources.populationPerAge;
    connector.getSourceSchema(connectorMock, source).then((result) => {
      done();
      expect(result.name).toBeTruthy();
    });
  });

  it('should get source schema with options', (done) => {
    const source = connectorMock.sources.populationPerAge;
    const { options } = connectorMock;
    connector.getSourceSchema(connectorMock, source, options).then((result) => {
      done();
      expect(result.schema).toBeTruthy();
    });
  });
});
