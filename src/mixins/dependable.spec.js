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
let globalDependencyMock;
describe('dependable mixin', () => {
  beforeEach(() => {
    globalDependencyMock = [
      {
        src: 'https://cdnjs.cloudflare.com/ajax/libs/quill/1.3.6/quill.min.js',
        type: 'script',
      },
    ];

    wrapper = shallow(component);
    delete window.Quill;
  });

  it('loads dependency', async () => {
    await wrapper.vm.loadDependencies(globalDependencyMock, 'Quill');
    expect(window.Quill).toBeTruthy();
  });

  it('loads dependency if already available', async () => {
    window.Quill = {};
    await wrapper.vm.loadDependencies(globalDependencyMock, 'Quill');
    expect(window.Quill).toBeTruthy();
  });
});
