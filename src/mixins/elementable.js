/*
This mixin is shared by all components.
Do not place any component specific logic here!
*/
import uuid from 'uuid/v4';
import { assign, kebabCase, map } from 'lodash';

export default {
  props: {
    definition: {
      type: Object,
      required: true,
    },
  },
  computed: {
    schema() {
      return assign({
        uid: uuid(),
        parentUid: null,
      }, this.definition._schema);
    },
    options() {
      return this.$chameleon;
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
          `${this.$options.namespace}${kebabCase(child.type)}`,
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
