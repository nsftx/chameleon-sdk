/*
Reserved for Ride Core connector.
*/
import http from 'axios';
import {
  filter,
  find,
  keyBy,
  map,
} from 'lodash';
import { uriEncoder } from '../../../utility';

const formatSourceSchema = (record, view) => {
  const formatted = map(view.fields, (field) => {
    const fieldSchema = find(record.fields, { id: field.displayFieldId });
    fieldSchema.name = field.displayName;

    return fieldSchema;
  });

  const filteredFields = filter(formatted, field => field.type !== 'primary');

  return filteredFields;
};

const getBaseUrl = (connectorOptions, connectorType, type) => {
  const api = connectorType.options.endpoint;
  const blueprintEndpoint = api[type];
  const url = `${blueprintEndpoint}/api/v1/${connectorOptions.space}`;

  return url;
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

    // Attach necessary data for READ implementation
    const viewModels = map(views, (view) => {
      const viewData = {
        id: view.id,
        name: view.name,
        model: view.name,
        dataPackage: dataPackageId,
        record: view.rootRecordId,
        schemaVersionId: data.versionId,
      };

      return viewData;
    });

    return keyBy(viewModels, item => item.name);
  });

  return latestSchemaReq;
};

export default {
  changeSourceData() {
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

    return http.get(
      `${baseUrl}/${source.schemaVersionId}/${source.record}`,
      { params: { viewId: source.id } },
    ).then((response) => {
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
    return getLatestSchema(baseUrl, source.dataPackage).then((result) => {
      const { records, views } = result.data.schema;
      const viewSchema = find(views, { id: source.id });
      const schema = find(records, { id: source.record });

      return { schema: formatSourceSchema(schema, viewSchema) };
    });
  },
};
