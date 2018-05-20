import { binding } from '../utility';

export default {
  methods: {
    /*
    Resolves dynamic value.
    */
    getBindingValue(value) {
      return binding.resolveDynamicValue(value, this);
    },
  },
};
