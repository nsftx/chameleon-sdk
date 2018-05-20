import { startsWith } from 'lodash';

export default {
  /*
  Resolves dynamic value.
  Dynamic value must start with equal (=) sign.
  If we detect dollar ($) sign after we try to resolve reference.
  Currently it only supports resolving references from store.
  */
  resolveDynamicValue(value, context) {
    if (!startsWith(value, '=')) {
      return value;
    }

    let binding = value.substring(1);

    /*
    For source of binding use registry or entire store.
    If there is a $ reference then use store first.
    If there is no $ reference then look in bindableElements registry.
    */
    let source;
    if (startsWith(binding, '$')) {
      // Fallback to registry or context for testing
      source = context.$store || context.registry || context;
      binding = binding.substring(1);
    } else if (context.registry) {
      source = context.registry.bindableElements;
    }

    if (source) {
      return binding.split('.').reduce((o, i) => {
        if (o[i]) return o[i];
        return value;
      }, source);
    }

    return value;
  },
};
