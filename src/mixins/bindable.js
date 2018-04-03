import { startsWith } from 'lodash';

export default {
  methods: {
    getBindingValue(value) {
      const elements = this.registry.bindableElements;
      if (elements && startsWith(value, '=')) {
        const binding = value.substring(1);
        return binding.split('.').reduce((o, i) => {
          if (o[i]) return o[i];
          return value;
        }, elements);
      }

      return value;
    },
  },
};
