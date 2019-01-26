import { createLocalVue, shallowMount } from '@vue/test-utils';
import elementable from './elementable';
import themable from './themable';

const localVue = createLocalVue();

const component = {
  data() {
    return {
    };
  },
  mixins: [
    elementable,
    themable,
  ],
  render(h) {
    return h('div');
  },
};

let wrapper;
describe('themable mixin', () => {
  beforeEach(() => {
    wrapper = shallowMount(component, {
      localVue,
      propsData: {
        definition: {
          type: 'panel',
          theme: 'dark',
        },
      },
    });
  });

  it('sets dark theme', () => {
    expect(wrapper.vm.isThemeDark).toBeTruthy();
    expect(wrapper.vm.themeBackgroundColor).toEqual('#424242');
    expect(wrapper.vm.themeTextColor).toEqual('rgba(255,255,255,1)');
  });

  it('sets light theme', () => {
    wrapper.setProps({
      definition: {
        type: 'panel',
        theme: 'light',
      },
    });

    expect(wrapper.vm.isThemeLight).toBeTruthy();
    expect(wrapper.vm.themeBackgroundColor).toEqual('#fff');
    expect(wrapper.vm.themeTextColor).toEqual('rgba(0,0,0,0.87)');
  });

  it('removes theme', () => {
    wrapper.setProps({
      definition: {
        type: 'panel',
        theme: null,
      },
    });

    expect(wrapper.vm.isThemeLight).toBeFalsy();
    expect(wrapper.vm.isThemeDark).toBeFalsy();
  });
});
