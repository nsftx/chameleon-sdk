/*
Local connectors that consumes dummy data.
Use this only for testing purposes as it will change
schema and data over time.
*/

import http from 'axios';
import {
  each,
  filter,
  flatMap,
  map,
  pick,
} from 'lodash';
import { getSavedSources } from '../common';

const filterOperations = {
  eq: (data, filterRule) => filter(data,
    item => item[filterRule.fields[0]] === filterRule.values[0]),
  ne: (data, filterRule) => filter(data,
    item => item[filterRule.fields[0]] !== filterRule.values[0]),
  in: () => {

  },
  notIn: () => {

  },
  startsWith: () => {

  },
};

const filterData = (data, filters) => {
  let result = data;

  each(filters, (filterRule) => {
    if (!filterRule.operator) return;

    result = filterOperations[filterRule.operator](result, filterRule);
  });

  return result;
};

const flattenFiltersDefinition = definition => flatMap(definition, item => [item, ...item.and]);

export default {
  getSources(connector, { savedOnly }) {
    if (savedOnly) return getSavedSources(connector);

    const url = `${connector.type.options.endpoint}/sources.json`;
    return http.get(url).then((response) => {
      const result = response.data;
      return result;
    });
  },
  getSourceData(connector, source) {
    const url = `${connector.type.options.endpoint}/${source.id}.json`;
    return http.get(url).then((response) => {
      const result = response.data;
      const filters = flattenFiltersDefinition(source.filters);

      const filteredData = filterData(result, filters);
      const columns = map(source.schema, n => n.name);

      return {
        [source.name]: {
          items: map(filteredData, m => pick(m, columns)),
        },
      };
    });
  },
  getSourceSchema(connector, source) {
    const url = `${connector.type.options.endpoint}/sourceSchema.json`;
    return http.get(url).then((response) => {
      const result = response.data;
      return result[source.id];
    });
  },
};
