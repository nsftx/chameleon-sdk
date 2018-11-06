/*
Generic HTTP REST connector.
This connector should implement OPEN API specification.
https://github.com/OAI/OpenAPI-Specification
https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.1.md
*/
// import { getCommonMeta } from '../utility';
import http from 'axios';
import { toLower } from 'lodash';

const getIdentifier = (source, options) => {
  const identifierName = source.schema.identifier;
  const identifier = options.params[identifierName];

  if (!identifier) throw new Error('Identifier not found');

  return identifier;
};

const createSourceData = (connector, source, options) => {
  const url = `${connector.url}/sources/${source.name}`;
  const { payload } = options;

  return http.post(url, payload).then(response => response.data);
};

const updateSourceData = (connector, source, options) => {
  const identifier = getIdentifier(source, options);
  const { payload } = options;

  const url = `${connector.url}/sources/${source.name}/schema/${identifier}`;

  return http.put(url, payload).then(response => response.data);
};

const deleteSourceData = (connector, source, options) => {
  const identifier = getIdentifier(source, options);

  const url = `${connector.url}/sources/${source.name}/schema/${identifier}`;

  return http.delete(url).then(response => response.data);
};

export default {
  getSources(connector, source) {
    const url = `${connector.url}/sources/${source.name}/schema`;

    return http.get(url).then(response => response.data);
  },
  getSourceSchema(connector, source) {
    const url = `${connector.url}/sources/${source.name}/schema`;

    return http.get(url).then(response => response.data);
  },
  getSourceData(connector, source) {
    const url = `${connector.url}/sources/${source.name}`;

    return http.get(url).then(response => response.data);
  },
  // deleteSourceData,
  // updateSourceData,
  // createSourceData,
  changeSourceData(connector, source, options) {
    const action = toLower(options.action);
    switch (action) {
      case 'delete':
        return deleteSourceData(connector, source);
      case 'update':
        return updateSourceData(connector, source);
      case 'create':
        return createSourceData(connector, source);
      default:
        throw new Error('Undefined Generic HTTP method');
    }
  },
};
