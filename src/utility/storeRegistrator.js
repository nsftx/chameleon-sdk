import { mapState, mapActions, mapGetters } from 'vuex';

export default {
  registerModule(context, storeModule, state) {
    context.registerModule(storeModule, state);
  },
  unregisterModule(context, storeModule, state) {
    context.registerModule(storeModule, state);
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
