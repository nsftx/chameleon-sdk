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
  isNumber,
  isUndefined,
  map,
  pick,
  startsWith,
  toNumber,
} from 'lodash';
import { compareAsc, isValid, parseISO } from 'date-fns';
import { getSavedSources } from '../common';
import { logger } from '../../../utility';

const valueComparators = {
  lt: (firstValue, secondValue) => firstValue < secondValue,
  lte: (firstValue, secondValue) => firstValue <= secondValue,
  gt: (firstValue, secondValue) => firstValue > secondValue,
  gte: (firstValue, secondValue) => firstValue >= secondValue,
};

const compareValues = (data, filterRule, comparator) => {
  const filterValue = filterRule.values[0];

  return filter(data, (item) => {
    const itemValue = item[filterRule.fields[0]];
    const itemValueDate = parseISO(itemValue);
    let diff;

    if (isNumber(itemValue)) {
      diff = itemValue - toNumber(filterValue);
    } else if (isValid(itemValueDate)) {
      diff = compareAsc(itemValueDate, parseISO(filterValue));
    } else {
      logger.error(`Expected Number or Date type, received ${typeof itemValue}`, data);
      return false;
    }

    return valueComparators[comparator](diff, 0);
  });
};

const filterOperations = {
  eq: (data, filterRule) => filter(data,
    item => item[filterRule.fields[0]] === filterRule.values[0]),
  ne: (data, filterRule) => filter(data,
    item => item[filterRule.fields[0]] !== filterRule.values[0]),
  in: (data, filterRule) => filter(data,
    item => filterRule.values.indexOf(item[filterRule.fields[0]]) >= 0),
  notIn: (data, filterRule) => filter(data,
    item => filterRule.values.indexOf(item[filterRule.fields[0]]) < 0),
  startsWith: (data, filterRule) => filter(data,
    item => startsWith(item[filterRule.fields[0]], filterRule.values[0])),
  lt: (data, filterRule) => compareValues(data, filterRule, 'lt'),
  lte: (data, filterRule) => compareValues(data, filterRule, 'lte'),
  gt: (data, filterRule) => compareValues(data, filterRule, 'gt'),
  gte: (data, filterRule) => compareValues(data, filterRule, 'gte'),
};

const filterData = (data, filters) => {
  let result = data;

  each(filters, (filterRule) => {
    if (!filterRule.operator) return;

    result = filterOperations[filterRule.operator](result, filterRule);
  });

  return result;
};

const flattenFiltersDefinition = (definition) => {
  const flatDefinition = flatMap(definition, (item) => {
    const filterItem = item;
    if (isUndefined(filterItem.and)) filterItem.and = [];

    return [item, ...item.and];
  });

  return flatDefinition;
};

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
      const filters = flattenFiltersDefinition(source.filters || []);

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
