import { assign, isNil, merge } from 'lodash';

export default {
  data() {
    return {
      dataSourceParams: {},
      loadingDataSource: false,
    };
  },
  computed: {
    dataSource() {
      return this.definition.dataSource;
    },
    dataConnector() {
      return this.dataSource.connector;
    },
    isDataSourceRemoteValid() {
      return !isNil(this.dataSource) && !isNil(this.dataConnector);
    },
    isDataSourceLocal() {
      return isNil(this.dataSource) ? null : this.dataSource.local === true;
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
            items: isNil(this.dataSource) ? null : this.dataSource.items,
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

          this.loadingDataSource = false;
          resolve(result);
        });
      });
    },
  },
};
