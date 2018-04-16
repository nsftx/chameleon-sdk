import Vue from 'vue';
import { createLocalVue, shallow } from '@vue/test-utils';
import elementable from './elementable';
import reactionable from './reactionable';

const localVue = createLocalVue();
localVue.prototype.$chameleon = {
  eventBus: new Vue(),
  bindableElements: {
    element: {
    },
  },
};

const component = {
  data() {
    return {
    };
  },
  mixins: [
    elementable,
    reactionable,
  ],
  render(h) {
    return h('div');
  },
};

let wrapper;
describe('reactionable mixin', () => {
  beforeEach(() => {
    wrapper = shallow(component, {
      localVue,
      propsData: {
        definition: {
          type: 'panel',
          _reactions: [],
        },
      },
    });
  });

  it('sets reactions', () => {
    expect(wrapper.vm.reactions).toBeTruthy();
  });
});
