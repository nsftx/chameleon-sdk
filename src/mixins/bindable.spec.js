import { createLocalVue, shallow } from '@vue/test-utils';
import elementable from './elementable';
import bindable from './bindable';

const localVue = createLocalVue();
localVue.prototype.$chameleon = {
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
    wrapper = shallow(component, {
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
    expect(bindingValue).toEqual(value);
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

  it('resolves with empty registry', () => {
    localVue.$chameleon = null;
    const value = 'myStaticValue';
    const bindingValue = wrapper.vm.getBindingValue(value);
    expect(bindingValue).toEqual(value);
  });
});
