import { mapState, mapActions, mapGetters } from 'vuex';

export default {
  registerModule(context, storeModule, state) {
    context.registerModule(storeModule, state);
  },
  unregisterModule(context, storeModule, state) {
    context.registerModule(storeModule, state);
  },
  mapState(path, prop) {
    return mapState.call(
      this,
      path,
      prop,
    );
  },
  mapGetters(path, prop) {
    return mapGetters.call(
      this,
      path,
      prop,
    );
  },
  mapActions(path, prop) {
    return mapActions.call(
      this,
      path,
      prop,
    );
  },
};
