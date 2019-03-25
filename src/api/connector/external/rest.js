import http from 'axios';
import {
  toLower,
  assign,
  each,
  isEmpty,
  omit,
  isNil,
} from 'lodash';
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

const getFilterField = param => ({
  name: `${param.fields[0]}:${param.operator}`,
  value: param.values[0],
});

const getCommonFilterQueryParams = (filterParams) => {
  if (!filterParams.fields || !filterParams.fields.length) return {};

  const baseField = getFilterField(filterParams);
  const parsedParams = {
    [baseField.name]: baseField.value,
  };

  each(filterParams.and, (filterParam) => {
    const field = getFilterField(filterParam);
    const fieldName = field.name;
    const fieldValue = field.value;

    if (!parsedParams[fieldName]) {
      parsedParams[fieldName] = fieldValue;
    } else {
      parsedParams[fieldName] = `${parsedParams[fieldName]},${fieldValue}`;
    }
  });

  return parsedParams;
};

const getExtendedFilterQueryParams = filterParams => ({
  filters: JSON.stringify(filterParams),
});

const getFilterQueryParams = (filterParams, filterFormat) => {
  if (filterFormat === 'extended') return getExtendedFilterQueryParams(filterParams);

  return getCommonFilterQueryParams(filterParams);
};

const getSortParam = (sortOrder, sortFieldParam) => {
  const sortOrderParam = toLower(sortOrder);
  const validAscParams = ['asc', '+'];
  const validDescParams = ['desc', '-'];

  let sortPrefix = '';

  if (validAscParams.includes(sortOrderParam)) sortPrefix = '+';
  if (validDescParams.includes(sortOrderParam)) sortPrefix = '-';

  return `${sortPrefix}${sortFieldParam}`;
};

const getClientParams = (optionParams = {}) => {
  const clientParams = {};

  clientParams.size = optionParams.size || optionParams.pageSize;
  clientParams.page = optionParams.page || optionParams.currentPage;

  clientParams.limit = optionParams.limit;
  clientParams.offset = optionParams.offset;

  clientParams.sort = optionParams.sortBy
    ? getSortParam(optionParams.sort, optionParams.sortBy) : null;

  clientParams.search = optionParams.search;

  return omit(clientParams, isNil);
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
    const filterFormat = source.meta && source.meta.filterFormat ? source.meta.filterFormat : 'common';

    let filterParams = {};

    if (!isEmpty(source.filters) || source.filters.length) {
      filterParams = getFilterQueryParams(source.filters[0], filterFormat);
    }

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
