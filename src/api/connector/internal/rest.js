/*
Reserved for Ride Core connector.
*/
import http from 'axios';
import {
  each,
  filter,
  find,
  keyBy,
  map,
  toLower,
} from 'lodash';
import { uriEncoder } from '../../../utility';

const formatSourceSchema = (record, view) => {
  const formatted = map(view.fields, (field) => {
    const viewField = field;
    const fieldSchema = find(record.fields, { id: field.displayFieldId });
    fieldSchema.name = field.displayName;

    viewField.type = fieldSchema.type;
    viewField.name = field.displayName;

    return viewField;
  });

  const filteredFields = filter(formatted, field => field.type !== 'primary');

  return filteredFields;
};

const getBaseUrl = (connectorOptions, connectorType, type) => {
  const api = connectorType.options.endpoint;
  const serviceEndpoint = api[type];
  const url = `${serviceEndpoint}/api/v1/${connectorOptions.space}`;

  return url;
};

const getChangeMethod = (options) => {
  const action = toLower(options.action);
  switch (action) {
    case 'delete':
      return action;
    case 'update':
      return 'patch';
    default:
      return 'post';
  }
};

/*
This will most probably be changed, as it's not certain
yet in which form will the payload be sent from UI components
*/
const getChangePayload = (payload, schema) => {
  if (!payload) return null;

  const change = {};

  each(payload, (value, key) => {
    const schemaField = find(schema, { name: key });
    change[schemaField.id] = value;
  });

  return change;
};

const getLatestSchema = (baseUrl, dataPackageId) => {
  const latestSchemaUrl = `${baseUrl}/data-packages/${dataPackageId}/schema-versions/uncommitted`;
  return http.get(latestSchemaUrl);
};

const getSeedData = (connectorType, source, options) => {
  const api = connectorType.options.endpoint.read;
  const schema = map(source.schema, (field) => {
    const fieldData = {
      name: field.name,
      type: field.type,
      multiValue: field.multiValue,
    };

    return fieldData;
  });

  const params = {
    numRecords: options.params ? options.params.pageSize : 10,
    schema: JSON.stringify({ name: 'test', schema }),
  };

  return http.get(`${api}/api/v1/misc/seed`, {
    params,
    paramsSerializer: uriEncoder.encode,
  }).then((response) => {
    const result = response.data;

    return {
      [source.name]: {
        items: result.data,
        pagination: result.metadata,
      },
    };
  });
};

const getViewModels = (baseUrl, dataPackageId) => {
  const latestSchemaReq = getLatestSchema(baseUrl, dataPackageId).then((result) => {
    const { data } = result;
    const { views } = data.schema;

    // Attach necessary data for READ & WRITE implementation
    const viewModels = map(views, (view) => {
      const viewData = {
        id: view.id,
        name: view.name,
        model: view.name,
        dataPackage: dataPackageId,
        record: view.rootRecordId,
        schemaVersion: data.versionId,
      };

      return viewData;
    });

    return keyBy(viewModels, item => item.name);
  });

  return latestSchemaReq;
};

export default {
  changeSourceData(connector, source, options) {
    const baseUrl = getBaseUrl(connector.options, connector.type, 'write');
    const method = getChangeMethod(options);
    const payload = getChangePayload(options.payload, options.schema);
    let url = `${baseUrl}/schema-versions/${source.schemaVersion}/records/${source.record}`;

    if (payload.recordInstanceId) {
      url += `/instances/${payload.recordInstanceId}`;
    }

    return http[method](url, payload).then((response) => {
      const result = response.data;
      return result;
    });
  },
  getSources(connector) {
    const baseUrl = getBaseUrl(
      connector.options,
      connector.type,
      'blueprint',
    );

    // Get all data packages
    // TODO: Change implementation after https://github.com/chmjs/ride-storage-blueprint/issues/40
    return http.get(`${baseUrl}/data-packages`).then((response) => {
      const dataPackage = response.data.dataPackages[0];

      // Take first data package and fetch its latest schema
      return getViewModels(baseUrl, dataPackage.id);
    });
  },
  getSourceData(connector, source, options) {
    const isSeed = options.seed;

    if (isSeed) return getSeedData(connector.type, source, options);

    const baseUrl = getBaseUrl(
      connector.options,
      connector.type,
      'read',
    );

    const fields = map(source.schema, field => field.id);
    const url = `${baseUrl}/schema-versions/${source.schemaVersion}/records/${source.record}/instances`;
    const params = {
      viewId: source.id,
      fields: JSON.stringify(fields),
    };

    return http.get(url, {
      params,
      paramsSerializer: uriEncoder.encode,
    }).then((response) => {
      const result = response.data;

      return {
        [source.name]: {
          items: result.data,
          pagination: result.metadata,
        },
      };
    });
  },
  getSourceSchema(connector, source) {
    const baseUrl = getBaseUrl(
      connector.options,
      connector.type,
      'blueprint',
    );

    return getLatestSchema(baseUrl, source.dataPackage).then((response) => {
      const result = response.data;
      const { records, views } = result.schema;
      const viewSchema = find(views, { id: source.id });
      const schema = find(records, { id: source.record });

      return {
        schema: formatSourceSchema(schema, viewSchema),
        schemaVersion: result.versionId,
      };
    });
  },
};
