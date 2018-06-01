import { assign, isNil } from 'lodash';
import * as internalTypes from './internal';
import * as externalTypes from './external';

const connectorTypes = assign({}, internalTypes, externalTypes);

const parseSourceData = (connector, source, options, data) => {
  const collection = data[source.name];

  const result = {
    connector: {
      name: connector.name,
      type: connector.type,
    },
    name: source.name,
    model: source.model,
    schema: source.schema,
    items: collection.items,
    pagination: collection.pagination,
  };

  return result;
};

export default {
  getConnectorType(connector) {
    const type = connectorTypes[connector.type];
    return type;
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
