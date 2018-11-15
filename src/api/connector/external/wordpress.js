/*
Connector to Wordpress implementation inside Chameleon Ride.
Use generic REST connector here when implemented.
Path: /connectors/wordpress
*/
import http from 'axios';
import { assign, toLower } from 'lodash';
import { getCommonMeta, getSavedSources } from '../common';

const getBaseUrl = (connector) => {
  const url = `${connector.options.endpoint}/${connector.name}`;
  return url;
};

const getChangeMethod = (options) => {
  const action = toLower(options.action);
  switch (action) {
    case 'delete':
      return action;
    default:
      return 'post';
  }
};

export default {
  changeSourceData(connector, source, options) {
    const url = `${getBaseUrl(connector.type)}/${source.name}`;
    const method = getChangeMethod(options);
    return http[method](url, assign(getCommonMeta(connector), options.payload)).then((response) => {
      const result = response.data;
      return result;
    });
  },
  getSources(connector, { savedOnly }) {
    if (savedOnly) return getSavedSources(connector);

    const url = getBaseUrl(connector.type);
    return http.get(url, getCommonMeta(connector)).then((response) => {
      const result = response.data;
      return result.sources;
    });
  },
  getSourceData(connector, source, options) {
    const url = `${getBaseUrl(connector.type)}/${source.name}`;
    return http.get(url, assign(getCommonMeta(connector), {
      params: options.params,
    })).then((response) => {
      const result = response.data;
      return result;
    });
  },
  getSourceSchema(connector, source) {
    const url = `${getBaseUrl(connector.type)}/${source.name}/schema`;
    return http.get(url, getCommonMeta(connector)).then((response) => {
      const result = response.data;
      return result;
    });
  },
};
