import { createLocalVue, shallowMount } from '@vue/test-utils';
import elementable from './elementable';
import bindable from './bindable';

const localVue = createLocalVue();

/*
Fake store just to test dynamic
reference resolve.
*/
localVue.prototype.$chameleon = {
  app: {
    pages: [
      { name: 'Page A' },
      { name: 'Page B' },
    ],
  },
  bindableElements: {
    element: {
      myDynamicProp: 'HelloBindable',
      dataSource: {
        myDynamicProp: 'HelloBindableSource',
      },
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
    bindable,
  ],
  render(h) {
    return h('div');
  },
};

let wrapper;
describe('bindable mixin', () => {
  beforeEach(() => {
    wrapper = shallowMount(component, {
      localVue,
      propsData: {
        definition: {
          type: 'panel',
        },
      },
    });
  });

  it('resolves static value', () => {
    const value = 'myStaticValue';
    const bindingValue = wrapper.vm.getBindingValue(value);
    expect(bindingValue).toEqual(value);
  });

  it('ignores invalid dynamic value', () => {
    const value = '=element..myDynamicProp';
    const bindingValue = wrapper.vm.getBindingValue(value);
    expect(bindingValue).toEqual('');
  });

  it('resolves dynamic value', () => {
    const value = '=element.myDynamicProp';
    const bindingValue = wrapper.vm.getBindingValue(value);
    expect(bindingValue).toEqual('HelloBindable');
  });

  it('resolves dynamic nested value', () => {
    const value = '=element.dataSource.myDynamicProp';
    const bindingValue = wrapper.vm.getBindingValue(value);
    expect(bindingValue).toEqual('HelloBindableSource');
  });

  it('resolves dynamic reference', () => {
    const value = '=$app.pages';
    const bindingValue = wrapper.vm.getBindingValue(value);
    expect(bindingValue).toHaveLength(2);
  });

  it('resolves with empty registry', () => {
    wrapper.vm.$chameleon = null;

    const value = 'myStaticValue';
    const bindingValue = wrapper.vm.getBindingValue(value);
    expect(bindingValue).toEqual(value);
  });
});
