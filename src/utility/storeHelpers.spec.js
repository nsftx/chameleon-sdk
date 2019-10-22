import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import storeHelpers from './storeHelpers';

const storeConfig = {
  state: { type: 'Page' },
  modules: {
    firstModule: {
      namespaced: true,
      state: { type: 'Widget' },
      getters: {
        type(state) {
          return state.type;
        },
      },
      mutations: {
        setItem(state) {
          state.type = 'Element';
        },
      },
      actions: {
        changeType(context) {
          context.commit('setItem');
        },
      },
    },
  },
};


const moduleState = {
  state: { type: 'Flow' },
};

const component = {
  data() {
    return {};
  },
  render(h) {
    return h('div');
  },
};

const localVue = createLocalVue();
localVue.use(Vuex);
const store = new Vuex.Store(storeConfig);

describe('Store helpers utility', () => {
  it('should register module in store', () => {
    const wrapper = shallowMount(component, {
      store,
      localVue,
      beforeCreate() {
        storeHelpers.registerModule(this, 'secondModule', moduleState);
      },
    });
    expect(wrapper.vm.$store.state.secondModule).toBeTruthy();
  });
  it('should map store state', () => {
    const wrapper = shallowMount(component, {
      store,
      localVue,
      computed: {
        ...storeHelpers.mapState(this, 'firstModule', ['type']),
      },
    });
    expect(wrapper.vm.type).toBe('Widget');
  });

  it('should map store getters', () => {
    const wrapper = shallowMount(component, {
      store,
      localVue,
      computed: {
        ...storeHelpers.mapGetters(this, 'firstModule', ['type']),
      },
    });
    expect(wrapper.vm.type).toBe('Widget');
  });

  it('should map store actions', () => {
    const wrapper = shallowMount(component, {
      store,
      localVue,
      methods: {
        ...storeHelpers.mapActions(this, 'firstModule', ['changeType']),
      },
      computed: {
        ...storeHelpers.mapGetters(this, 'firstModule', ['type']),
      },
    });
    wrapper.vm.changeType();
    expect(wrapper.vm.type).toBe('Element');
  });

  it('should unregister module in store', () => {
    const wrapper = shallowMount(component, {
      store,
      localVue,
      beforeCreate() {
        storeHelpers.registerModule(this, 'secondModule', moduleState);
      },
    });
    storeHelpers.unregisterModule(wrapper.vm, 'secondModule', moduleState);
    expect(wrapper.vm.$store.state.secondModule).toBeFalsy();
  });
});
