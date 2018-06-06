import Vue from 'vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import elementable from './elementable';
import reactionable from './reactionable';

const localVue = createLocalVue();
localVue.prototype.$chameleon = {
  eventBus: new Vue(),
  bindableElements: {
    MyTable: {
      dataSource: {
        name: 'MyTableSourceName',
      },
    },
  },
};

const component = {
  data() {
    return {
      myActionResult: null,
    };
  },
  mixins: [
    elementable,
    reactionable,
  ],
  methods: {
    myAction(payload, data) {
      this.myActionResult = {
        payload,
        data,
      };
    },
  },
  render(h) {
    return h('div');
  },
};

const wrapper = shallowMount(component, {
  localVue,
  propsData: {
    definition: {
      type: 'panel',
      _id: 'MyPanel',
      _reactions: [
        {
          component: 'MyTable',
          componentType: 'table',
          event: 'MyTableEvent',
          listener: 'MyTable.MyTableEvent',
          action: 'myAction',
          schema: [{
            name: 'field',
            mapName: 'mapField',
          }],
          data: {
            key: 'value',
          },
        },
      ],
    },
  },
});

describe('reactionable mixin', () => {
  it('sets eventBus', () => {
    expect(wrapper.vm.eventBus).toBeTruthy();
  });

  it('sets reactions', () => {
    expect(wrapper.vm.reactions).toBeTruthy();
  });

  it('sets eventBusListeners', () => {
    const listener = wrapper.vm.eventBusListeners[0];
    expect(listener.name).toEqual('MyTable.MyTableEvent');
    expect(listener.callback).toBeTruthy();
  });

  it('sends eventBus event', (done) => {
    const payload = { field: true };

    wrapper.vm.eventBus.$on('MyPanel.MyPanelEvent', (receivedPayload) => {
      done();
      expect(receivedPayload).toEqual(payload);
    });

    wrapper.vm.sendToEventBus('MyPanelEvent', payload);
  });

  it('maps action payload', () => {
    const spy = jest.spyOn(wrapper.vm, 'myAction');

    wrapper.vm.eventBus.$emit('MyTable.MyTableEvent', {
      field: true,
    });

    expect(spy).toHaveBeenCalled();
    expect(wrapper.vm.myActionResult).toEqual({
      payload: {
        mapField: true,
      },
      data: {
        key: 'value',
      },
    });

    spy.mockReset();
    spy.mockRestore();
  });

  it('removes eventBusListeners', () => {
    wrapper.vm.removeReactions();
    expect(wrapper.vm.eventBusListeners.length).toEqual(0);
  });
});
