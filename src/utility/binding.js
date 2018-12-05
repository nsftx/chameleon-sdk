import {
  isNil,
  isString,
  startsWith,
  template,
} from 'lodash';

import logger from './logger';

export default {
  /*
  Resolves dynamic value.
  Dynamic value must start with equal (=) sign.
  If we detect dollar ($) sign after we try to resolve reference.
  Currently it only supports resolving references from store.
  */
  resolveDynamicValue(value, context) {
    if (isNil(context) || !isString(value) || !startsWith(value, '=')) {
      return value;
    }

    let binding = value.substring(1);

    /*
    For source of binding use registry or entire store.
    If there is a $ reference then use store first.
    If there is no $ reference then look in bindableElements registry.
    Cover both cases of usage. In Builder and in generated app.
    */
    const isRegistryAvailable = !isNil(context.$store) && !isNil(context.$store.getters.registry);
    let source = isRegistryAvailable ? context.$store.getters.registry : context.registry;

    if (startsWith(binding, '$')) {
      binding = binding.substring(1);
    } else {
      source = source.bindableElements;
    }

    if (source) {
      return binding.split('.').reduce((o, i) => {
        if (o[i]) return o[i];
        return value;
      }, source);
    }

    return value;
  },
  /*
  Sets expression as a compiled template function.
  Method can receive template options as second parameter.
  https://lodash.com/docs/4.17.11#templateSettings
  */
  setExpression(expression, options) {
    return template(expression, options);
  },
  /*
  Resolves expression by executing compiled template function.
  Second parameter is context that serves as data to template function.
  */
  resolveExpression(expressionFunction, context, defaultValue) {
    let value;

    try {
      // JSON.parse - expressionFunction is always returning String
      value = expressionFunction(context);
      try {
        value = JSON.parse(value);
      } catch (error) {
        return value;
      }
    } catch (error) {
      logger.warn('Error resolving expression');
      value = defaultValue;
    }

    return value;
  },
};
