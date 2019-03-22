import {
  assign,
  isNil,
  isString,
  merge,
} from 'lodash';

import { mapping } from '../utility';

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
        seed: this.registry.isPreviewMode,
        context: {
          registry: this.registry,
          parent: this.$parent,
        },
      };
    },
    loadConnectorData() {
      return new Promise((resolve) => {
        if (
          this.isDataSourceLocal
          || !this.options.connectors
          || !this.isDataSourceRemoteValid
        ) {
          return resolve({
            items: isNil(this.dataSource) ? null : this.mapDataSourceItems(this.dataSource.items),
            pagination: {},
          });
        }

        const connector = assign(
          {},
          this.dataConnector,
          this.options.connectors[this.dataConnector.id],
        );

        const source = merge({},
          connector.sources[this.dataSource.id],
          {
            schema: this.dataSource.schema,
            filters: this.dataSource.filters,
            meta: this.dataSource.meta,
          });

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
      const { schema } = this.dataSource;
      return mapping.mapWithSchema(schema, items);
    },
  },
};
