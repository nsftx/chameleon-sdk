import { assign, isNil, isString, map, each, merge } from 'lodash';

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

        const connector = assign({},
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
      if (this.dataSource.schema) {
        const hasMapping = find(this.dataSource.schema, field => !isNil(field.mapName));
        if (hasMapping) {
          return map(items, (item) => {
            const mappedItem = item;
            each(this.dataSource.schema, (field) => {
              if (field.mapName) {
                mappedItem[field.mapName] = item[field.name];
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
