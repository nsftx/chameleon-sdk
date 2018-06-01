/*
Connector to Wordpress implementation inside Chameleon Ride.
Use generic REST connector here when implemented.
Path: /connectors/wordpress
*/
import http from 'axios';
import { assign } from 'lodash';
import { getCommonMeta } from '../utility';

const getBaseUrl = (connector) => {
  const url = `${connector.options.endpoint}/${connector.name}`;
  return url;
};

export default {
  getSources(connector) {
    const url = getBaseUrl(connector);
    return http.get(url, getCommonMeta()).then((response) => {
      const result = response.data;
      return result.sources;
    });
  },
  getSourceData(connector, source, options) {
    const url = `${getBaseUrl(connector)}/${source.name}`;
    return http.get(url, assign(getCommonMeta(), {
      params: options.params,
    })).then((response) => {
      const result = response.data;
      return result;
    });
  },
  getSourceSchema(connector, source) {
    const url = `${getBaseUrl(connector)}/${source.name}/schema`;
    return http.get(url, getCommonMeta()).then((response) => {
      const result = response.data;
      return result;
    });
  },
};
