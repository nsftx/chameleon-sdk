import { isNil, startsWith } from 'lodash';

export default {
  /*
  Resolves dynamic value.
  Dynamic value must start with equal (=) sign.
  If we detect dollar ($) sign after we try to resolve reference.
  Currently it only supports resolving references from store.
  */
  resolveDynamicValue(value, context) {
    if (isNil(context) || !startsWith(value, '=')) {
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
};
