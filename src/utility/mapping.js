import {
  each,
  find,
  isArray,
  isNil,
  keys,
  map,
} from 'lodash';

const mapItem = (schema, item) => {
  const mappedItem = {};
  each(schema, (field) => {
    if (!isNil(item[field.name])) {
      // Add mapped value
      if (field.mapName) {
        mappedItem[field.mapName] = item[field.name];
      } else {
        // Add default value if it's not mapped
        mappedItem[field.name] = item[field.name];
      }
    }
  });

  return mappedItem;
};

const mapNestedSource = (source, schema) => {
  if (isArray(source)) {
    return map(source, (item) => {
      const mappedItem = mapItem(schema, item);

      // Loop trough nested items
      const itemKeys = keys(mappedItem);
      map(itemKeys, (key) => {
        if (isArray(mappedItem[key]) && mappedItem[key].length) {
          mappedItem[key] = mapNestedSource(mappedItem[key], schema);
        }
      });
      return mappedItem;
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
    const mappedSource = {};
    if (isArray(schema)) {
      const hasMapping = !isNil(find(schema, field => !isNil(field.mapName)));

      if (hasMapping) {
        return mapNestedSource(source, schema, mappedSource);
      }
    }

    return source;
  },
};
