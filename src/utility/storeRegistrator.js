import { mapState, mapActions, mapGetters } from 'vuex';
import logger from './logger';

export default {
  registerModule(context, moduleName, state) {
    if (!context || !moduleName || !state) {
      logger.warn('Context, module name or state is not provided');
      return;
    }
    context.$store.registerModule(moduleName, state);
  },
  unregisterModule(context, moduleName, state) {
    if (!context || !moduleName || !state) {
      logger.warn('Context, module name or state is not provided');
      return;
    }
    context.$store.unregisterModule(moduleName, state);
  },
  mapState(context, moduleName, properties) {
    return mapState.call(
      context,
      moduleName,
      properties,
    );
  },
  mapGetters(context, moduleName, properties) {
    return mapGetters.call(
      context,
      moduleName,
      properties,
    );
  },
  mapActions(context, moduleName, properties) {
    return mapActions.call(
      context,
      moduleName,
      properties,
    );
  },
};
