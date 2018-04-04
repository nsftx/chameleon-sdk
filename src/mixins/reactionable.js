import { each, isArray } from 'lodash';

export default {
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
      return this.definition._reactions;
    },
  },
  methods: {
    /*
    This method sets listeners on eventBus based on reactions
    defined in component. Reaction has signature:
    {
      listener: 'componentName.eventName',
      action: 'actionName',
      params: [],
    }
    */
    setReactions() {
      if (this.eventBus && isArray(this.reactions)) {
        each(this.reactions, (reaction) => {
          if (reaction.listener && reaction.action) {
            this.eventBus.$on(reaction.listener, (payload) => {
              /*
              TODO:
              Implement advanced options:
              - Payload mapping
              - Additional params inside reaction
              */
              const method = this[reaction.action];
              if (method) {
                method.call(this, payload);
              }
            });
          }
        });
      }
    },
  },
};
