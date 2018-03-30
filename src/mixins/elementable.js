/*
This mixin is shared by all components.
Do not place any component specific logic here!
*/
import uuid from 'uuid/v4';
import { assign, map } from 'lodash';

export default {
  props: {
    definition: {
      type: Object,
      required: true,
    },
  },
  computed: {
    eventBus() {
      /*
      eventBus is a vue instance used for communication between
      components. This bus will be used by all elements. Bus is
      exposed as eventBus property of registry from builder state
      or from bundle options (generated apps and test env).
      */
      return this.options ? this.options.eventBus : null;
    },
    schema() {
      return assign({
        uid: uuid(),
        parentUid: null,
      }, this.definition._schema);
    },
    options() {
      /*
      Bundle can access store registry.
      If store is not available then fallback to prototype vue instance.
      Prototype vue instance is created for testing bundle without builder
      and/or for generated apps where this information is also needed.
      */
      const registry = this.$store && this.$store.getters.registry;
      return registry || this.$chameleon;
    },
  },
  data() {
    return {
      /*
      Static classes needed for chameleon builder.
      This is required for all elements used in builder.
      */
      baseClass: 'c-element',
      baseParentClass: 'c-element-parent',
      baseChildrenClass: 'c-element-children',
    };
  },
  methods: {
    /*
    DEPRECATED:
    Helper function to support element types which are
    not namespaces. This should be only used in base
    material bundle.
    */
    getElementTag(type) {
      const separatorIndex = type.indexOf('-');
      if (separatorIndex > -1 && separatorIndex <= 2) {
        return type;
      }

      return `${this.$options.namespace}${type}`;
    },
    /*
    Generates data attributes needed
    for chameleon builder.
    */
    getSchemaAttributes() {
      return {
        'data-type': this.schema.type,
        'data-group': this.schema.group,
        'data-uid': this.schema.uid,
        'data-parent': this.schema.parentUid,
      };
    },
    /*
    Renders child components of container that
    has no specific children like panel, hlist, vlist.
    */
    renderChildren(createElement) {
      const children = this.definition.elements;
      return map(children, (child) => {
        const el = createElement(
          this.getElementTag(child.type),
          {
            key: `${child.type}_${uuid()}`,
            staticClass: `${this.$options.name}-item`,
            props: {
              definition: child,
            },
          },
        );

        return el;
      });
    },
  },
};
