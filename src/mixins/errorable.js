import { logger } from '../utility';

export default {
  data() {
    return {
      error: {},
      warning: {},
    };
  },
  methods: {
    setError(msg) {
      throw new Error(msg);
    },
    errorHandler(msg, info) {
      const vm = this;
      const error = msg && msg.message ? msg.message : msg;
      const message = 'There was an error rendering the component';
      if (info === 'render') {
        vm.error.msg = message;
      } else {
        vm.error.msg = error;
      }
      vm.error.info = info;
      logger.error(error, info);
    },
    warnHandler(msg, info) {
      const vm = this;
      const warning = msg && msg.message ? msg.message : msg;
      vm.warning.msg = warning;
      vm.warning.info = info;
      logger.warn(warning, info);
    },
    renderErrorTemplate() {
      const data = {
        props: {
          type: 'error',
          value: true,
        },
      };
      return this.$createElement('v-alert', data, [this.error.msg]);
    },
  },
};
