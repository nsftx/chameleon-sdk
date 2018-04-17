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

const wrapper = shallow(component, {
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

describe('sourceable mixin', () => {
  it('sets dataSource', () => {
    expect(wrapper.vm.dataSource).toBeTruthy();
  });

  it('sets valid remote dataSource', () => {
    expect(wrapper.vm.isDataSourceLocal).toBeFalsy();
    expect(wrapper.vm.isDataSourceRemoteValid).toBeTruthy();
  });

  it('sets exact dataConnector', () => {
    expect(wrapper.vm.dataConnector.type).toEqual('internalLocal');
  });

  it('loads data from remote', (done) => {
    wrapper.vm.loadConnectorData().then((result) => {
      done();
      expect(result.name).toBeTruthy();
      expect(result.model).toBeTruthy();
      expect(result.schema instanceof Array).toBeTruthy();
      expect(result.items.length).toBeGreaterThan(0);
    });
  });
});
