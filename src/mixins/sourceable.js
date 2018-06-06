import {
  assign,
  isNil,
  isString,
  find,
  map,
  each,
  merge,
} from 'lodash';

export default {
  data() {
    return {
      dataSourceParams: {},
      loadingDataSource: false,
    };
  },
  computed: {
    dataSource() {
      const source = this.config.dataSource;
      if (isString(source)) {
        return this.getBindingValue(source);
      }

      return source;
    },
    dataConnector() {
      return this.dataSource.connector;
    },
    isDataSourceRemoteValid() {
      return !isNil(this.dataSource) && !isNil(this.dataConnector);
    },
    isDataSourceLocal() {
      return isNil(this.dataSource) ? true : this.dataSource.local === true;
    },
  },
  methods: {
    getMergedDataSourceParams() {
      return {
        params: merge(this.dataSourceParams, this.dataSource.params),
      };
    },
    loadConnectorData() {
      return new Promise((resolve) => {
        if (
          this.isDataSourceLocal ||
          !this.options.connectors ||
          !this.isDataSourceRemoteValid
        ) {
          resolve({
            items: isNil(this.dataSource) ? null : this.mapDataSourceItems(this.dataSource.items),
            pagination: {},
          });
        }

        const connector = assign(
          {},
          this.dataConnector,
          this.options.connectors[this.dataConnector.name],
        );

        const source = merge({}, {
          schema: this.dataSource.schema,
        }, connector.sources[this.dataSource.name]);

        this.loadingDataSource = true;
        return this.options.connector.getSourceData(
          connector,
          source,
          this.getMergedDataSourceParams(),
        ).then((result) => {
          this.dataSourceParams = {
            pagination: result.pagination,
          };

          if (result.items) {
            assign(result, {
              items: this.mapDataSourceItems(result.items),
            });
          }

          this.loadingDataSource = false;
          resolve(result);
        });
      });
    },
    mapDataSourceItems(items) {
      /*
      TODO:
      Implement mapping for nested objects.
      */
      const { schema } = this.dataSource;

      if (schema) {
        const hasMapping = !isNil(find(schema, field => !isNil(field.mapName)));
        if (hasMapping) {
          const originalSuffix = '_$';
          /* eslint no-param-reassign:"off" */
          return map(items, (item) => {
            /*
            To handle all kinds of mapping we are creating original
            properties for each item. This is double loop and maybe
            should be optimized once nesting is implemented.
            */
            each(schema, (field) => {
              item[`${field.name}${originalSuffix}`] = item[field.name];
            });

            each(schema, (field) => {
              if (field.mapName) {
                item[field.mapName] = item[`${field.name}${originalSuffix}`];
              }
            });

            return item;
          });
        }
      }

      return items;
    },
  },
};
