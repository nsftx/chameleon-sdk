import http from 'axios';

import {
  each,
  find,
  isEmpty,
  map,
} from 'lodash';

import { getCommonMeta, getSavedSources } from '../common';

const getQueryParams = (source) => {
  const args = [];
  const bindings = [];
  each(source.params, (arg) => {
    args.push(`$${arg.name}: ${arg.type}`);
    bindings.push(`${arg.name}: $${arg.name}`);
  });

  if (!isEmpty(source.filters)) {
    args.push('$filters: JSON');
    bindings.push('filters: $filters');
  }

  const params = {
    args: '',
    bindings: '',
  };

  if (!isEmpty(args)) {
    params.args = `(${args.join(',')})`;
    params.bindings = `(${bindings.join(',')})`;
  }

  if (source.params && source.params.pagination) {
    params.pagination = 'pagination { totalResults }';
  }

  return params;
};

const getQueryFields = (source) => {
  const list = map(source.schema, 'name');
  return list.join(' ');
};

const getQuery = (source) => {
  const { name } = source;
  const params = getQueryParams(source);
  const pagination = params.pagination || '';

  return `query ${name}${params.args} {
    ${name}${params.bindings} {
      items {
        ${getQueryFields(source)}
      }
      ${pagination}
    }
  }`;
};

const getSchemaTypeQuery = () => {
  const query = `query schemaType($name: String!) {
    __type(name: $name) {
      name
      kind
      fields {
        name
        args {
          name
          type {
            name
          }
        }
        type {
          name
          kind
          fields {
            name
            type {
              name
              ofType {
                name
                kind
              }
            }
          }
          ofType {
            name
            kind
            fields {
              name
              type {
                name
              }
            }
          }
        }
      }
    }
  }`;

  return query;
};

const getRootType = (response) => {
  const { data } = response;
  // eslint-disable-next-line
  return data.data.__type;
};

const getSourceModel = (source) => {
  if (source.type) {
    const items = find(source.type.fields, { name: 'items' });
    if (items) {
      return items.type.ofType.name;
    }
  }

  return null;
};

export default {
  changeSourceData(connector) {
    throw new Error(`Method changeSourceData is not implemented on ${connector.name} connector!`);
  },
  getSources(connector, { savedOnly }) {
    if (savedOnly) return getSavedSources(connector);

    const connectorType = connector.type;
    const url = `${connectorType.options.endpoint}/${connectorType.name}`;
    return http.post(url, {
      query: getSchemaTypeQuery(),
      variables: {
        name: 'Query',
      },
    }, getCommonMeta(connector)).then((response) => {
      const data = getRootType(response);
      const sources = {};

      each(data.fields, (item) => {
        const model = getSourceModel(item);

        if (model) {
          const source = {
            name: item.name,
            model,
          };

          const params = {};
          if (item.args) {
            each(item.args, (n) => {
              params[n.name] = {
                name: n.name,
                type: n.type.name,
              };
            });
          }

          source.params = params;
          sources[item.name] = source;
        }
      });

      return sources;
    });
  },
  getSourceData(connector, source, options) {
    const connectorType = connector.type;
    const url = `${connectorType.options.endpoint}/${connectorType.name}`;
    return http.post(url, {
      query: getQuery(source),
      variables: {
        ...options.params,
        filters: source.filters,
      },
    }, getCommonMeta(connector)).then((response) => {
      const result = response.data.data;
      return result;
    });
  },
  getSourceSchema(connector, source) {
    const connectorType = connector.type;
    const url = `${connectorType.options.endpoint}/${connectorType.name}`;
    return http.post(url, {
      query: getSchemaTypeQuery(),
      variables: {
        name: source.model,
      },
    }, getCommonMeta(connector)).then((response) => {
      const data = getRootType(response);
      const schema = [];

      each(data.fields, (item) => {
        schema.push({
          name: item.name,
          type: item.type.name,
        });
      });

      return {
        name: data.name,
        schema,
      };
    });
  },
};
