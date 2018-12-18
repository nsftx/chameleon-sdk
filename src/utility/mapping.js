import {
  each,
  find,
  isArray,
  isNil,
  keys,
  map,
} from 'lodash';

const originalSuffix = '_$';

const mapItem = (schema, item) => {
  /* eslint no-param-reassign:"off" */
  each(schema, (field) => {
    item[`${field.name}${originalSuffix}`] = item[field.name];
  });

  each(schema, (field) => {
    let isSwitch = false;

    if (field.mapName && !isNil(item[field.name])) {
      isSwitch = !isNil(item[field.mapName]);
      item[field.mapName] = item[`${field.name}${originalSuffix}`];
      if (!isSwitch) {
        delete item[field.name];
      }
    }

    delete item[`${field.name}${originalSuffix}`];
  });

  return item;
};

const mapNestedSource = (source, schema) => {
  if (isArray(source)) {
    return map(source, (item) => {
      mapItem(schema, item);

      // Loop trough nested items
      const itemKeys = keys(item);
      each(itemKeys, (key) => {
        if (isArray(item[key]) && item[key].length) {
          mapNestedSource(item[key], schema);
        }
      });
      return item;
    });
  }
  return mapItem(schema, source);
};

export default {
  /*
  To handle all kinds of mapping we are creating original
  properties for each item. This is double loop and maybe
  should be optimized once nesting is implemented.
  */
  mapWithSchema(schema, source) {
    if (isArray(schema)) {
      const hasMapping = !isNil(find(schema, field => !isNil(field.mapName)));

      if (hasMapping) {
        return mapNestedSource(source, schema);
      }
    }

    return source;
  },
};
