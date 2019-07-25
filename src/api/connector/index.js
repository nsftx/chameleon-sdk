import { assign, isFunction } from 'lodash';
import * as internalTypes from './internal';
import * as externalTypes from './external';
import { logger } from '../../utility';

const connectorTypes = assign({}, internalTypes, externalTypes);

const parseSourceData = (connector, source, options, data) => {
  const collection = data[source.name];

  const result = {
    connector: {
      id: connector.id,
      name: connector.name,
      type: connector.type.name,
    },
    id: source.id,
    name: source.name,
    model: source.model,
    schema: source.schema,
    meta: source.meta,
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
    id: source.id,
    name: source.name,
    model: source.model,
    meta: source.meta,
    schema: source.schema,
    data,
  };

  return result;
};

export default {
  /*
    Options object should have `action` and `payload` properties.
    Action is used to differentiate methods on connector backend API.
    */
  changeSourceData(connector, source, options = {}) {
    const connectorType = this.getConnectorType(connector.type);

    if (!isFunction(connectorType.changeSourceData)) {
      const message = `Changing source data is not supported on ${connector.name} connector`;
      logger.error(message);
      return Promise.reject(message);
    }

    return connectorType.changeSourceData(connector, source, options).then((data) => {
      const result = parseChangeSourceData(connector, source, options, data);
      return result;
    });
  },
  getConnectorType(connector) {
    const type = connectorTypes[connector.type];
    return type;
  },
  getSources(connector, options = {}) {
    const connectorType = this.getConnectorType(connector.type);
    return connectorType.getSources(connector, options);
  },
  getSourceData(connector, source, options = {}) {
    const connectorType = this.getConnectorType(connector.type);

    return connectorType.getSourceData(connector, source, options).then((data) => {
      const result = parseSourceData(connector, source, options, data);
      return result;
    });
  },
  getSourceSchema(connector, source, options) {
    const connectorType = this.getConnectorType(connector.type);
    return connectorType.getSourceSchema(connector, source, options);
  },
};
