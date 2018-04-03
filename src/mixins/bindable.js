import { get, startsWith } from 'lodash';

export default {
  methods: {
    getBindingValue(value) {
      if (this.registry.bindableElements && startsWith(value, '=')) {
        const bindingValue = value.substring(1);
        return get(this.registry.bindableElements, bindingValue);
      }

      return value;
    },
  },
};
