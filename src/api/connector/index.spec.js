import axiosMock from 'axios';
import connector from './index';

axiosMock.get.mockImplementation(() => Promise.resolve({
  data: {
    PopulationPerAge: {
      name: 'PopulationPerAge',
      schema: [
        {
          name: 'age',
          type: 'String',
        },
        {
          name: 'population',
          type: 'Number',
        },
      ],
    },
  },
}));

const connectorMock = {
  name: 'My local',
  id: '1334',
  type: {
    name: 'local',
    type: 'internalLocal',
    description: 'Local Connector',
    disabled: false,
    options: {
      endpoint: 'https://chameleon.nsoft.com/static/data',
    },
    schema: null,
    multipleInstances: false,
  },
  sources: {
    populationPerAge: {
      name: 'populationPerAge',
      model: 'populationPerAge',
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
