import { mapState, mapActions, mapGetters } from 'vuex';
import logger from './logger';

export default {
  registerModule(context, moduleName, state) {
    if (!context || !moduleName || !state) {
      logger.warn('Please provide valid informations');
      return;
    }
    if (context.state && context.state[moduleName]) {
      logger.warn(`Module with ${moduleName} name is already registered`);
      return;
    }
    context.registerModule(moduleName, state);
  },
  unregisterModule(context, moduleName, state) {
    if (!context || !moduleName || !state) {
      logger.warn('Please provide valid informations');
      return;
    }

    if (context.state && context.state[moduleName]) {
      context.registerModule(moduleName, state);
    }
  },
  mapState(context, path, prop) {
    return mapState.call(
      context,
      path,
      prop,
    );
  },
  mapGetters(context, path, prop) {
    return mapGetters.call(
      context,
      path,
      prop,
    );
  },
  mapActions(context, path, prop) {
    return mapActions.call(
      context,
      path,
      prop,
    );
  },
};
