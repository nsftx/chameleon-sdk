import { cloneDeep, each, isArray, isNil } from 'lodash';
import { logger, mapping } from '../utility';

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
    isReactionable() {
      return !isNil(this.eventBus) && isArray(this.reactions);
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
        mapName: 'mapName',
      }],
      data: {
        key: 'value',
      },
    }
    */
    setReactions() {
      if (!this.isReactionable) {
        return false;
      }

      each(this.reactions, (reaction) => {
        if (isNil(reaction.listener) || isNil(reaction.action)) {
          return false;
        }

        const listener = (payload) => {
          const method = this[reaction.action];
          if (isNil(method)) {
            logger.warn('Missing reactionable action', reaction.action);
            return false;
          }

          /*
          If reaction has schema attached then map
          payload. Payload input schema can be definied by
          bundle inside meta of action. If schema is not
          defined user would have to know payload structure
          and bind manually.
          */
          return method.call(
            this,
            mapping.mapWithSchema(reaction.schema, payload),
            reaction.data,
          );
        };

        this.eventBusListeners.push({
          name: reaction.listener,
          callback: listener,
        });

        this.eventBus.$on(reaction.listener, listener);

        return true;
      });

      return true;
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
  watch: {
    reactions() {
      this.removeReactions();
      this.setReactions();
    },
  },
  beforeDestroy() {
    this.removeReactions();
  },
};
