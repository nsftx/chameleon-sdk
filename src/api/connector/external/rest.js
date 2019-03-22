import http from 'axios';
import { toLower, assign } from 'lodash';
import { getSavedSources, getCommonMeta } from '../common';
import { logger, uriParser } from '../../../utility';

const getIdentifier = (source, options) => {
  const identifierName = source.schema.identifier;
  const identifier = options.params[identifierName];

  if (!identifier) {
    logger.error('Identifier field not found in params');
    throw new Error('Identifier field not found in params');
  }

  return identifier;
};

const getSortPrefix = (sortOrder) => {
  const sortOrderParam = toLower(sortOrder);
  let sortPrefix = '';

  if (sortOrderParam === 'desc') sortPrefix = '-';
  else if (sortOrderParam === 'asc') sortPrefix = '+';

  return sortPrefix;
};

const getCommonFilterQuery = filterParams => ({
  filters: filterParams,
});

const getExtendedFilterQuery = filterParams => ({
  filters: JSON.stringify(filterParams),
});

const getFilterQueryParams = (filterParams) => {
  const flag = true; // test flag until real arg param is passed

  if (!filterParams) return {};
  if (flag) return getExtendedFilterQuery(filterParams);
  if (!flag) return getCommonFilterQuery(filterParams);

  return getCommonFilterQuery(filterParams);
};

const getClientParams = (optionParams) => {
  const clientParams = {};

  if (optionParams.size) clientParams.size = optionParams.size;
  if (optionParams.page) clientParams.page = optionParams.page;

  if (optionParams.limit) clientParams.limit = optionParams.limit;
  if (optionParams.offset) clientParams.offset = optionParams.offset;

  if (optionParams.sortBy) clientParams.sort = `${getSortPrefix(optionParams.sort)}${optionParams.sortBy}`;

  if (optionParams.search) clientParams.search = optionParams.search;

  return clientParams;
};

const getCommonParams = (connector) => {
  const authConfig = connector.options.auth;
  const basicAuthParams = authConfig.username && authConfig.password ? {
    headers: {
      authorization: `Basic ${btoa(`${authConfig.username}:${authConfig.password}`)}`,
    },
  } : {};

  return assign(getCommonMeta(connector), basicAuthParams);
};

// API Methods

const createSourceData = (connector, source, options) => {
  const { endpoint } = connector.options;
  const { payload } = options;

  const url = uriParser.joinUrl(endpoint, `/sources/${source.name}`);

  return http.post(url, payload, getCommonParams(connector)).then(response => response.data);
};

const updateSourceData = (connector, source, options) => {
  const identifier = getIdentifier(source, options);
  const { endpoint } = connector.options;
  const { payload } = options;

  const url = uriParser.joinUrl(endpoint, `${endpoint}/sources/${source.name}/${identifier}`);

  return http.put(url, payload, getCommonParams(connector)).then(response => response.data);
};

const deleteSourceData = (connector, source, options) => {
  const identifier = getIdentifier(source, options);
  const { endpoint } = connector.options;

  const url = `${endpoint}/sources/${source.name}/${identifier}`;

  return http.delete(url, getCommonParams(connector)).then(response => response.data);
};

export default {
  getSources(connector, { savedOnly }) {
    if (savedOnly) return getSavedSources(connector);

    const { endpoint } = connector.options;
    const url = uriParser.joinUrl(endpoint, '/sources');

    return http.get(url, getCommonParams(connector)).then(response => response.data.sources);
  },
  getSourceSchema(connector, source) {
    const { endpoint } = connector.options;
    const url = uriParser.joinUrl(endpoint, `/sources/${source.name}/schema`);

    return http.get(url, getCommonParams(connector)).then(response => response.data);
  },
  getSourceData(connector, source, options) {
    const { endpoint } = connector.options;
    const url = uriParser.joinUrl(endpoint, `/sources/${source.name}`);
    const clientParams = options && options.params ? getClientParams(options.params) : null;
    const filterParams = getFilterQueryParams(source.filters);

    return http.get(url, assign(getCommonParams(connector), {
      params: assign(clientParams, filterParams),
    })).then(response => response.data);
  },
  changeSourceData(connector, source, options) {
    const actionName = toLower(options.action);

    const actionMap = {
      delete: deleteSourceData,
      update: updateSourceData,
      create: createSourceData,
    };

    if (!actionMap[actionName]) {
      logger.error('Undefined Generic HTTP changeSource action');
      throw new Error('Undefined Generic HTTP changeSource action');
    }

    return actionMap[actionName](connector, source, options);
  },
};
