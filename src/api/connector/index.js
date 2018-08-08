import { assign, isNil } from 'lodash';
import * as internalTypes from './internal';
import * as externalTypes from './external';

const connectorTypes = assign({}, internalTypes, externalTypes);

const parseSourceData = (connector, source, options, data) => {
  const collection = data[source.name];

  const result = {
    connector: {
      id: connector.id,
      name: connector.name,
      type: connector.type.name,
    },
    name: source.name,
    model: source.model,
    schema: source.schema,
    items: collection.items,
    pagination: collection.pagination,
  };

  return result;
};

const parseChangeSourceData = (connector, source, options, data) => {
  const result = {
    connector: {
      id: connector.id,
      name: connector.name,
      type: connector.type.name,
    },
    name: source.name,
    model: source.model,
    schema: source.schema,
    data,
  };

  return result;
};

export default {
  changeSourceData(connector, source, options) {
    /*
    Options object should have `action` and `payload` properties.
    Action is used to differentiate methods on connector backend API.
    */
    const opts = isNil(options) ? {} : options;
    const connectorType = this.getConnectorType(connector);

    return connectorType.changeSourceData(connector, source, opts).then((data) => {
      const result = parseChangeSourceData(connector, source, opts, data);
      return result;
    });
  },
  getConnectorType(connector) {
    const type = connectorTypes[connector.type];
    return type;
  },
  getSources(connector) {
    const connectorType = this.getConnectorType(connector.type);
    return connectorType.getSources(connector);
  },
  getSourceData(connector, source, options) {
    const opts = isNil(options) ? {} : options;
    const connectorType = this.getConnectorType(connector.type);

    return connectorType.getSourceData(connector, source, opts).then((data) => {
      const result = parseSourceData(connector, source, opts, data);
      return result;
    });
  },
  getSourceSchema(connector, source) {
    const connectorType = this.getConnectorType(connector.type);
    return connectorType.getSourceSchema(connector, source);
  },
};
