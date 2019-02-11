import {
  each,
  find,
  isArray,
  isNil,
  keys,
  map,
  template,
} from 'lodash';

const mapItem = (schema, item) => {
  const mappedItem = {};
  each(schema, (field) => {
    if (!isNil(item[field.name])) {
      // Add mapped value and mask if set
      const fieldName = field.mapName ? field.mapName : field.name;
      mappedItem[fieldName] = field.mask ? template(field.mask)(item) : item[field.name];
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
    if (isArray(schema)) {
      const hasMapping = !isNil(find(schema, field => !isNil(field.mapName)));
      const hasMask = !isNil(find(schema, field => !isNil(field.mask)));

      if (hasMapping || hasMask) {
        return mapNestedSource(source, schema);
      }
    }

    return source;
  },
};
