import {
  clone,
  each,
  find,
  isArray,
  isNil,
  map,
} from 'lodash';

const originalSuffix = '_$';

/*
There is a lot of cloning here to handle mapping.
When implementing nesting we need to use cloneDeep.
This method should be optimized if possible as it
would be slow on large datasets. Test performance.
*/
const mapItem = (schema, item) => {
  /* eslint no-param-reassign:"off" */
  each(schema, (field) => {
    item[`${field.name}${originalSuffix}`] = clone(item[field.name]);
  });

  each(schema, (field) => {
    let isSwitch = false;

    if (field.mapName) {
      isSwitch = !isNil(item[field.mapName]);
      item[field.mapName] = clone(item[`${field.name}${originalSuffix}`]);

      if (!isSwitch) {
        delete item[field.name];
      }
    }

    delete item[`${field.name}${originalSuffix}`];
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
        return isArray(source)
          ? map(source, item => mapItem(schema, item))
          : mapItem(schema, source);
      }
    }

    return source;
  },
};
