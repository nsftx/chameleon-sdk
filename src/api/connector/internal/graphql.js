import http from 'axios';
import { each, isEmpty, isNil, map } from 'lodash';
import { localStorage } from '../../../utility';

const getOptions = () => {
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
      ${getQueryFields(source)}
    }
  }`;
};

const getQueryVariables = (source, filters) => {
  const vars = {};

  if (!isEmpty(filters)) {
    each(filters, (filter, key) => {
      if (source.params[key]) {
        vars[key] = filter;
      }
    });
  }

  return vars;
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
          ofType {
            name
            kind
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

export default {
  getSources(connector) {
    return http.post(connector.options.endpoint, {
      query: getSchemaTypeQuery(),
      variables: {
        name: 'Query',
      },
    }, getOptions()).then((response) => {
      const data = getRootType(response);
      const sources = {};
      each(data.fields, (item) => {
        if (item.type.ofType) {
          const source = {
            name: item.name,
            model: item.type.ofType.name,
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
  getSourceData(connector, source, { filters }) {
    return http.post(connector.options.endpoint, {
      query: getQuery(source),
      variables: getQueryVariables(source, filters),
    }, getOptions()).then((response) => {
      const result = response.data.data;
      return result;
    });
  },
  getSourceSchema(connector, source) {
    return http.post(connector.options.endpoint, {
      query: getSchemaTypeQuery(),
      variables: {
        name: source.model,
      },
    }, getOptions()).then((response) => {
      const data = getRootType(response);

      const schema = {};
      each(data.fields, (item) => {
        schema[item.name] = {
          name: item.name,
          type: item.type.name,
        };
      });

      return {
        name: data.name,
        schema,
      };
    });
  },
};
