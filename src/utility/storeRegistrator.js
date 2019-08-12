import { mapState, mapActions, mapGetters } from 'vuex';
import { isArray } from 'lodash';
import logger from './logger';

export default {
  registerModule(context, name, state) {
    if (!context || !name || !state) {
      logger.warn('Context, module name or state is not provided');
      return;
    }

    const moduleName = isArray(name) ? name[0] : name;
    if (context.$store && context.$store.state && context.$store.state[moduleName]) {
      logger.warn(`Module ${moduleName} is already registered`);
      return;
    }
    context.$store.registerModule(name, state);
  },
  unregisterModule(context, name, state) {
    if (!context || !name || !state) {
      logger.warn('Context, module name or state is not provided');
      return;
    }
    const moduleName = isArray(name) ? name[0] : name;
    if (context.$store && context.$store.state && !context.$store.state[moduleName]) {
      logger.warn(`Module ${moduleName} is not registered`);
      return;
    }
    context.$store.unregisterModule(name, state);
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
