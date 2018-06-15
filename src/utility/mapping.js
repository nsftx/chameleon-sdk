import { each, find, isArray, isNil, map } from 'lodash';

const originalSuffix = '_$';

const mapItem = (schema, item) => {
  /* eslint no-param-reassign:"off" */
  each(schema, (field) => {
    item[`${field.name}${originalSuffix}`] = item[field.name];
  });

  each(schema, (field) => {
    if (field.mapName) {
      item[field.mapName] = item[`${field.name}${originalSuffix}`];
    }
  });

  return item;
};

export default {
  /*
  To handle all kinds of mapping we are creating original
  properties for each item. This is double loop and maybe
  should be optimized once nesting is implemented.

  TODO:
  Implement mapping of nested objects.
  */
  mapWithSchema(schema, source) {
    if (isArray(schema)) {
      const hasMapping = !isNil(find(schema, field => !isNil(field.mapName)));

      if (hasMapping) {
        return isArray(source) ?
          map(source, item => mapItem(schema, item)) :
          mapItem(schema, source);
      }
    }

    return source;
  },
};
