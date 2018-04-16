import { createLocalVue, shallow } from '@vue/test-utils';
import { connector } from '../api';
import elementable from './elementable';
import sourceable from './sourceable';

const connectors = {
  local: {
    name: 'local',
    type: 'internalLocal',
    description: 'Local Connector',
    disabled: false,
    options: {
      endpoint: 'https://chameleon.nsoft.com/static/data',
    },
    sources: {
      populationPerAge: {
        name: 'populationPerAge',
        model: 'PopulationPerAge',
      },
    },
  },
};

const localVue = createLocalVue();
localVue.prototype.$chameleon = {
  connector,
  connectors,
};

const component = {
  data() {
    return {
    };
  },
  mixins: [
    elementable,
    sourceable,
  ],
  render(h) {
    return h('div');
  },
};

let wrapper;
describe('sourceable mixin', () => {
  beforeEach(() => {
    wrapper = shallow(component, {
      localVue,
      propsData: {
        definition: {
          type: 'table',
          dataSource: {
            name: 'populationPerAge',
            model: 'PopulationPerAge',
            connector: {
              name: 'local',
              type: 'internalLocal',
            },
            schema: [
              {
                name: 'age',
                type: 'String',
                label: 'Age',
              },
              {
                name: 'population',
                type: 'Number',
                label: 'Population',
              },
            ],
          },
        },
      },
    });
  });

  it('gets dataSource', () => {
    expect(wrapper.vm.dataSource).toBeTruthy();
  });
});
