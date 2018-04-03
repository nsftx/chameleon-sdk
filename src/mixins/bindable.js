import { startsWith } from 'lodash';

export default {
  methods: {
    getBindingValue(value) {
      const elements = this.registry.bindableElements;
      if (elements && startsWith(value, '=')) {
        const binding = value.substring(1);
        return binding.split('.').reduce((o, i) => o[i], elements);
      }

      return value;
    },
  },
};
