import { mount } from '@vue/test-utils';
import bindable from './bindable';

const component = {
  data() {
    return {
      registry: {
        bindableElements: {
          element: {
            myDynamicProp: 'HelloBindable',
            dataSource: {
              myDynamicProp: 'HelloBindableSource',
            },
          },
        },
      },
    };
  },
  mixins: [
    bindable,
  ],
  render(h) {
    return h('div');
  },
};

let wrapper;
describe('bindable mixin', () => {
  beforeEach(() => {
    wrapper = mount(component);
  });

  test('resolves static value', () => {
    const value = 'myStaticValue';
    const bindingValue = wrapper.vm.getBindingValue(value);
    expect(bindingValue).toEqual(value);
  });

  test('ignores invalid dynamic value', () => {
    const value = '=element..myDynamicProp';
    const bindingValue = wrapper.vm.getBindingValue(value);
    expect(bindingValue).toEqual(value);
  });

  test('resolves dynamic value', () => {
    const value = '=element.myDynamicProp';
    const bindingValue = wrapper.vm.getBindingValue(value);
    expect(bindingValue).toEqual('HelloBindable');
  });

  test('resolves dynamic nested value', () => {
    const value = '=element.dataSource.myDynamicProp';
    const bindingValue = wrapper.vm.getBindingValue(value);
    expect(bindingValue).toEqual('HelloBindableSource');
  });
});
