import { isNil, startsWith } from 'lodash';

export default {
  methods: {
    /*
    Resolves dynamic value.
    Dynamic value must start with equal (=) sign.
    If we detect dollar ($) sign after we try to resolve reference.
    Currently it only supports resolving references from store.
    */
    getBindingValue(value) {
      if (isNil(this.registry)) {
        return value;
      }

      if (startsWith(value, '=')) {
        let binding = value.substring(1);

        /*
        For source of binding use registry or entire store.
        If there is a $ reference then use store first.
        If there is no $ reference then look in bindableElements registry.
        */
        let source = this.registry.bindableElements;
        if (startsWith(binding, '$')) {
          source = isNil(this.$store) ? this.registry : this.$store;
          binding = binding.substring(1);
        }

        if (source) {
          return binding.split('.').reduce((o, i) => {
            if (o[i]) return o[i];
            return value;
          }, source);
        }
      }

      return value;
    },
  },
};
