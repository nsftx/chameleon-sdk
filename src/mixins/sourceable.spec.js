import axiosMock from 'axios';
import { keys } from 'lodash';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import { connector } from '../api';
import bindable from './bindable';
import elementable from './elementable';
import sourceable from './sourceable';

axiosMock.get.mockImplementation(() => Promise.resolve({
  data: [
    {
      population: 2704659,
      age: '<5',
      items: [
        {
          population: 8819342, age: '45-64',
        },
        {
          population: 1712463, age: '≥65',
        },
      ],
      active: true,
    },
    { population: 4499890, age: '5-13', active: true },
    { population: 2159981, age: '14-17', active: true },
    { population: 3853788, age: '18-24', active: false },
    { population: 14106543, age: '25-44', active: false },
    { population: 8819342, age: '45-64', active: true },
    { population: 1712463, age: '≥65', active: true },
  ],
}));

const connectors = {
  1334: {
    name: 'My local',
    id: '1334',
    type: {
      name: 'local',
      type: 'internalLocal',
      description: 'Local Connector',
      disabled: false,
      options: {
        endpoint: 'https://chameleon.nsoft.com/static/data',
      },
      schema: null,
      multipleInstances: false,
    },
    sources: {
      populationPerAge: {
        id: 'populationPerAge',
        name: 'populationPerAge',
        model: 'populationPerAge',
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
        id: 'populationPerAge',
        name: 'populationPerAge',
        model: 'PopulationPerAge',
        connector: {
          id: '1334',
          name: 'My local',
          type: {
            name: 'local',
            type: 'internalLocal',
            description: 'Local Connector',
            disabled: false,
            options: {
              endpoint: 'https://chameleon.nsoft.com/static/data',
            },
            schema: null,
            multipleInstances: false,
          },
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
          {
            name: 'items',
            type: 'Array',
            label: 'Items',
            mapName: 'children',
          },
          {
            name: 'active',
            type: 'Boolean',
            label: 'Active',
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
    expect(wrapper.vm.dataConnector.type.type).toEqual('internalLocal');
  });

  it('loads data from remote', (done) => {
    wrapper.vm.loadConnectorData().then((result) => {
      expect(result.name).toBeTruthy();
      expect(result.model).toBeTruthy();
      expect(result.schema instanceof Array).toBeTruthy();
      expect(result.schema[1].mapName).toEqual('age');
      expect(result.schema[3].mapName).toBeUndefined();
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.items[0].population).toEqual('<5');
      expect(result.items[0].children[0].age).toEqual(8819342);
      expect(result.items[0].children.length).toEqual(2);
      expect(keys(result.items[0]).length).toEqual(4);
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
