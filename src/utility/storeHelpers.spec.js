import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import storeHelpers from './storeHelpers';

const storeConfig = {
  state: { product: 'Car' },
  modules: {
    a: {
      state: { product: 'Module car' },
    },
  },
};


const moduleState = {
  state: { product: 'Car' },
  mutations: {
    setProduct(state, newProduct) {
      state.product = newProduct;
    },
  },

  getters: {
    product(state) {
      return state.product;
    },
  },
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
        storeHelpers.registerModule(this, 'testModule', moduleState);
      },
    });
    expect(wrapper.vm.$store.state.testModule).toBeTruthy();
  });
  it('should map store state', () => {
    const wrapper = shallowMount(component, {
      store,
      localVue,
      computed: {
        ...storeHelpers.mapState(this, 'a', ['product']),
      },
    });
    expect(wrapper.vm.product).toBe('Module car');
  });

  it('should map store getters', () => {
    const wrapper = shallowMount(component, {
      store,
      localVue,
      computed: {
        ...storeHelpers.mapGetters(this, 'a', ['product']),
      },
    });
    expect(wrapper.vm.product).toBeTruthy();
  });

  it('should unregister module in store', () => {
    const wrapper = shallowMount(component, {
      store,
      localVue,
      beforeCreate() {
        storeHelpers.registerModule(this, 'testModule', moduleState);
      },
    });
    storeHelpers.unregisterModule(wrapper.vm, 'testModule', moduleState);
    expect(wrapper.vm.$store.state.testModule).toBeFalsy();
  });
});
