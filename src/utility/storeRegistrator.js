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

    if (context.state && !context.state[moduleName]) {
      logger.warn(`Module with ${moduleName} name is not registered`);
      return;
    }

    if (context.state && context.state[moduleName]) {
      context.registerModule(moduleName, state);
    }
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
