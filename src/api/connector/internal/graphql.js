import http from 'axios';
import { each, find, isEmpty, isNil, map } from 'lodash';
import { localStorage } from '../../../utility';

const getMeta = () => {
  const token = localStorage.getAuthToken();
  const headers = {};

  if (!isNil(token)) {
    headers.authorization = `Bearer ${token}`;
  }

  return {
    headers,
  };
};

const getQueryParams = (source) => {
  if (!isEmpty(source.params)) {
    const args = [];
    const bindings = [];
    each(source.params, (arg) => {
      args.push(`$${arg.name}: ${arg.type}`);
      bindings.push(`${arg.name}: $${arg.name}`);
    });

    return {
      args: `(${args.join(',')})`,
      bindings: `(${bindings.join(',')})`,
    };
  }

  return {
    args: '',
    bindings: '',
  };
};

const getQueryFields = (source) => {
  const list = map(source.schema, 'name');
  return list.join(' ');
};

const getQuery = (source) => {
  const name = source.name;
  const params = getQueryParams(source);

  return `query ${name}${params.args} { 
    ${name}${params.bindings} {
      items {
        ${getQueryFields(source)}
      }
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
  const data = response.data;
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
  getSources(connector) {
    const url = connector.options.endpoint;
    return http.post(url, {
      query: getSchemaTypeQuery(),
      variables: {
        name: 'Query',
      },
    }, getMeta()).then((response) => {
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
    const url = connector.options.endpoint;
    return http.post(url, {
      query: getQuery(source),
      variables: options.params,
    }, getMeta()).then((response) => {
      const result = response.data.data;
      return result;
    });
  },
  getSourceSchema(connector, source) {
    const url = connector.options.endpoint;
    return http.post(url, {
      query: getSchemaTypeQuery(),
      variables: {
        name: source.model,
      },
    }, getMeta()).then((response) => {
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
