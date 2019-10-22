import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import storeHelpers from './storeHelpers';

const createStore = () => {
  const state = {
    product: 'Bingo',
  };

  return {
    state,
  };
};


const moduleState = {
  state: { product: 'Car' },
  mutations: {
    increment(state, newProduct) {
      state.product = newProduct;
    },
  },

  getters: {
    doubleCount(state) {
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
const storeConfig = createStore();
localVue.use(Vuex);
const store = new Vuex.Store(storeConfig);
let wrapper;

describe('Store helpers utility', () => {
  beforeEach(() => {
    wrapper = shallowMount(component, {
      store,
      localVue,
    });
  });

  it('should register module in store', () => {
    storeHelpers.registerModule(wrapper.vm, 'testModule', moduleState);
    expect(wrapper.vm.$store.state.testModule).toBeTruthy();
  });

  it('should unregister module in store', () => {
    storeHelpers.unregisterModule(wrapper.vm, 'testModule', moduleState);
    expect(wrapper.vm.$store.state.testModule).toBeFalsy();
  });

  it('should map store state', () => {
    storeHelpers.mapState(wrapper.vm, 'testModule', ['product']);
  });

  it('should map store getters', () => {
    storeHelpers.mapGetters(wrapper.vm, 'testModule', ['product']);
  });

  it('should map store actions', () => {
    storeHelpers.mapActions(wrapper.vm, 'testModule', ['product']);
  });
});
