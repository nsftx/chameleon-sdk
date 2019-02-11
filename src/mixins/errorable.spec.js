import Vue from 'vue';
import { shallowMount } from '@vue/test-utils';
import errorable from './errorable';

describe('Errorable Mixin', () => {
  it('Compares Error on update', () => {
    const error = 'There was an error on update';
    const component = {
      template: '<div :p="a" />',
      updated() {
        // Throw error on update
        this.setError(error);
      },
      mixin: [errorable],
      data() {
        return {
          a: 1,
        };
      },
    };

    const wrapper = shallowMount(component, {
      mixins: [errorable],
    });

    // Can not attach error handler to localVue
    // eslint-disable-next-line
    Vue.config.errorHandler = (error, vm, info) => {
      vm.$options.methods.errorHandler.call(vm, error, info);
    };

    wrapper.vm.a = 2;
    expect(wrapper.vm.error.msg).toEqual(error);
  });
});
