/*
This mixin is shared by all components.
Do not place any component specific logic here!
*/
import { v4 } from 'uuid';
import { assign, cloneDeep, map } from 'lodash';

const uuid = () => v4();

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
      }, this.config._schema);
    },
    /* DEPRECATED: Use this.registry in components */
    options() {
      return this.registry;
    },
    registry() {
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
      This is a local copy of definition object.
      If component uses reactions to change definition then
      config should be mutated. Recommendation is that bundles
      use config in their components.
      */
      config: {},
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
      } else if (this.$options.namespace) {
        return `${this.$options.namespace}${type}`;
      }

      return type;
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
    renderChildren() {
      const children = this.config.elements;
      return map(children, (child) => {
        const el = this.$createElement(
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
    setConfig(value) {
      this.config = cloneDeep(value);
    },
  },
  watch: {
    definition: {
      handler(value) {
        this.setConfig(value);
      },
      /*
      Arghhhh!
      This is not needed in generated apps.
      Set it to false when using in generated apps by
      setting env variable CHAMELEON_OPTIMIZE.
      */
      deep: !process.env.CHAMELEON_OPTIMIZE,
    },
  },
  created() {
    this.setConfig(this.definition);
  },
};
