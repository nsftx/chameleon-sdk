import { isNil } from 'lodash';
import * as connectorTypes from './internal';

const parseSourceData = (connector, source, options, data) => {
  const result = {
    connector: {
      name: connector.name,
      type: connector.type,
    },
    name: source.name,
    model: source.model,
    schema: source.schema,
  };

  if (options.copyDataSource) {
    result.items = data[source.name];
  }

  return result;
};

export default {
  getConnectorType(connector) {
    return connectorTypes[connector.type];
  },
  getSources(connector) {
    const connectorType = this.getConnectorType(connector);
    return connectorType.getSources(connector);
  },
  getSourceData(connector, source, options) {
    const opts = isNil(options) ? {} : options;
    const connectorType = this.getConnectorType(connector);
    return connectorType.getSourceData(connector, source, opts).then((data) => {
      const result = parseSourceData(connector, source, opts, data);
      return result;
    });
  },
  getSourceSchema(connector, source) {
    const connectorType = this.getConnectorType(connector);
    return connectorType.getSourceSchema(connector, source);
  },
};
