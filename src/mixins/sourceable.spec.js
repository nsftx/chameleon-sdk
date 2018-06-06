import axiosMock from 'axios';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import { connector } from '../api';
import bindable from './bindable';
import elementable from './elementable';
import sourceable from './sourceable';

axiosMock.get.mockImplementation(() => Promise.resolve({
  data: [
    { population: 2704659, age: '<5' },
    { population: 4499890, age: '5-13' },
    { population: 2159981, age: '14-17' },
    { population: 3853788, age: '18-24' },
    { population: 14106543, age: '25-44' },
    { population: 8819342, age: '45-64' },
    { population: 1712463, age: '≥65' },
  ],
}));

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
    bindable,
    sourceable,
  ],
  render(h) {
    return h('div');
  },
};

let wrapper = shallowMount(component, {
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
        /* We are switching property names to check mapping */
        schema: [
          {
            name: 'age',
            type: 'String',
            label: 'Age',
            mapName: 'population',
          },
          {
            name: 'population',
            type: 'Number',
            label: 'Population',
            mapName: 'age',
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
      expect(result.name).toBeTruthy();
      expect(result.model).toBeTruthy();
      expect(result.schema instanceof Array).toBeTruthy();
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.items[0].population).toEqual('<5');
      done();
    });
  });

  it('sets dataSource reference', () => {
    wrapper = shallowMount(component, {
      localVue,
      propsData: {
        definition: {
          type: 'table',
          dataSource: '=myReference',
        },
      },
    });

    expect(wrapper.vm.dataSource).toEqual('=myReference');
  });

  it('sets local dataSource', (done) => {
    wrapper = shallowMount(component, {
      localVue,
      propsData: {
        definition: {
          type: 'table',
          dataSource: {
            local: true,
            items: [
              { field: true },
            ],
          },
        },
      },
    });

    wrapper.vm.loadConnectorData().then((result) => {
      done();
      expect(result.items.length).toEqual(1);
    });
  });
});
