/*
Local connectors that consumes dummy data.
Use this only for testing purposes as it will change
schema and data over time.
*/

import http from 'axios';

export default {
  getSources(connector) {
    const url = `${connector.options.endpoint}/sources.json`;
    return http.get(url).then((response) => {
      const result = response.data;
      return result;
    });
  },
  getSourceData(connector, source) {
    const connectorType = connector.type;
    const url = `${connectorType.options.endpoint}/${source.name}.json`;
    return http.get(url).then((response) => {
      const result = response.data;
      return {
        [source.name]: {
          items: result,
        },
      };
    });
  },
  getSourceSchema(connector, source) {
    const url = `${connector.options.endpoint}/sourceSchema.json`;
    return http.get(url).then((response) => {
      const result = response.data;
      return result[source.model];
    });
  },
};
