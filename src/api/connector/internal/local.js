/*
Local connectors that consumes dummy data.
Use this only for testing purposes as it will change
schema and data over time.
*/

import http from 'axios';
import { map, pick } from 'lodash';

export default {
  getSources(connector) {
    const url = `${connector.type.options.endpoint}/sources.json`;
    return http.get(url).then((response) => {
      const result = response.data;
      return result;
    });
  },
  getSourceData(connector, source) {
    const url = `${connector.type.options.endpoint}/${source.name}.json`;
    return http.get(url).then((response) => {
      const result = response.data;
      const columns = map(source.schema, n => n.name);

      return {
        [source.name]: {
          items: map(result, m => pick(m, columns)),
        },
      };
    });
  },
  getSourceSchema(connector, source) {
    const url = `${connector.type.options.endpoint}/sourceSchema.json`;
    return http.get(url).then((response) => {
      const result = response.data;
      return result[source.model];
    });
  },
};
