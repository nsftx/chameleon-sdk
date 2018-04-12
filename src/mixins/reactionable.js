import {
  cloneDeep,
  each,
  isArray,
} from 'lodash';

export default {
  data() {
    return {
      eventBusListeners: [],
    };
  },
  computed: {
    eventBus() {
      /*
      eventBus is a vue instance used for communication between
      components. This bus will be used by all elements. Bus is
      exposed as eventBus property of registry from builder state
      or from bundle options (generated apps and test env).
      */
      return this.registry ? this.registry.eventBus : null;
    },
    reactions() {
      return this.config._reactions;
    },
  },
  methods: {
    /*
    Send event using eventBus.
    This is a helper method that checks and adds component id
    to event name and basically simplifies process across
    all components. We are cloning payload to pass value, not
    reactive reference.
    */
    sendToEventBus(name, payload) {
      const id = this.config._id;
      if (id && this.eventBus) {
        this.eventBus.$emit(`${id}.${name}`, cloneDeep(payload));
      }
    },
    /*
    This method sets listeners on eventBus based on reactions
    defined in component. Reaction has signature:
    {
      component: 'componentName',
      componentType: 'componentType',
      event: 'eventName',
      listener: 'componentName.eventName',
      action: 'actionName',
      schema: [{
        name: 'name',
        mapName, 'mapName',
      }],
      data: {
        key: 'value',
      },
    }
    */
    setReactions() {
      if (this.eventBus && isArray(this.reactions)) {
        each(this.reactions, (reaction) => {
          if (reaction.listener && reaction.action) {
            const listener = (payload) => {
              const method = this[reaction.action];

              if (method) {
                /*
                If reaction has schema attached then map
                payload. Payload input schema can be definied by
                bundle inside meta of action. If schema is not
                defined user would have to know payload structure
                and bind manually.

                TODO:
                Implement mapping of nested objects.
                */
                const outputPayload = payload;
                if (isArray(reaction.schema)) {
                  each(reaction.schema, (field) => {
                    outputPayload[field.mapName] = outputPayload[field.name];
                    delete outputPayload[field.name];
                  });
                }

                method.call(this, outputPayload, reaction.data);
              } else {
                // eslint-disable-next-line
                console.warn('[CHM] Missing reactionable action:', reaction.action);
              }
            };

            this.eventBusListeners.push({
              name: reaction.listener,
              callback: listener,
            });

            this.eventBus.$on(reaction.listener, listener);
          }
        });
      }
    },
    /*
    Unregister listeners from event bus.
    This needs to be called on component destroy.
    */
    removeReactions() {
      if (this.eventBusListeners.length) {
        each(this.eventBusListeners, (listener) => {
          this.eventBus.$off(listener.name, listener.callback);
        });

        this.eventBusListeners = [];
      }
    },
  },
  mounted() {
    this.setReactions();
  },
  beforeDestroy() {
    this.removeReactions();
  },
};
