import { shallow } from '@vue/test-utils';
import dependable from './dependable';

const component = {
  data() {
    return {
    };
  },
  mixins: [
    dependable,
  ],
  render(h) {
    return h('div');
  },
};

let wrapper;
describe('dependable mixin', () => {
  beforeEach(() => {
    wrapper = shallow(component);
  });

  test('loads dependency', async () => {
    await wrapper.vm.loadDependencies([
      {
        src: 'https://cdnjs.cloudflare.com/ajax/libs/quill/1.3.6/quill.min.js',
        type: 'script',
      },
    ], 'Quill');

    expect(window.Quill).toBeTruthy();
  });
});
