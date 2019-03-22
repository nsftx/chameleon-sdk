import http from 'axios';
import { toLower, assign, each } from 'lodash';
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

  if (sortOrderParam === 'desc') return '-';
  if (sortOrderParam === 'asc') return '+';

  return '';
};

const getFilterField = param => ({
  name: `${param.fields[0]}:${param.operator}`,
  value: param.values[0],
});

const getCommonFilterQuery = (filterParams) => {
  if (!filterParams.fields || !filterParams.fields.length) return {};

  const baseField = getFilterField(filterParams);
  const parsedParams = {
    [baseField.name]: baseField.value,
  };

  each(filterParams.and, (filterParam) => {
    const field = getFilterField(filterParam);

    if (!parsedParams[field.name]) {
      parsedParams[field.name] = field.value;
    } else {
      parsedParams[field.name] = `${parsedParams[field.name]},${field.value}`;
    }
  });

  return parsedParams;
};

const getExtendedFilterQuery = filterParams => ({
  filters: JSON.stringify(filterParams),
});

const getFilterQueryParams = (filterParams, filterFormat) => {
  if (!filterParams) return {};
  if (filterFormat === 'extended') return getExtendedFilterQuery(filterParams);

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

const enrichSchemaResponseWithMeta = schemaResponse => ({
  ...schemaResponse,
  meta: {
    filterFormat: schemaResponse.schema.filters.format,
  },
});

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

    return http.get(
      url,
      getCommonParams(connector),
    ).then(response => enrichSchemaResponseWithMeta(response.data));
  },
  getSourceData(connector, source, options) {
    const { endpoint } = connector.options;
    const url = uriParser.joinUrl(endpoint, `/sources/${source.name}`);
    const clientParams = options && options.params ? getClientParams(options.params) : null;
    const filterParams = getFilterQueryParams(source.filters[0], 'common');

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
