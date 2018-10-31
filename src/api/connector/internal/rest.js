/*
Reserved for Ride Core connector.
*/
import http from 'axios';
import { filter, find, map } from 'lodash';

const formatSourceSchema = (record, view) => {
  const formatted = map(view.fields, (field) => {
    const fieldSchema = find(record.fields, { id: field.displayFieldId });
    fieldSchema.name = field.displayName;

    return fieldSchema;
  });

  const filteredFields = filter(formatted, field => field.type !== 'primary');

  return filteredFields;
};

const getBaseBlueprintUrl = (connectorOptions, connectorType) => {
  const api = connectorType.options.endpoint;
  const blueprintEndpoint = api.blueprint;
  const url = `${blueprintEndpoint}/api/v1/${connectorOptions.space}`;

  return url;
};

const getLatestSchema = (baseUrl, dataPackageId) => {
  const latestSchemaUrl = `${baseUrl}/data-packages/${dataPackageId}/schema-versions/uncommitted`;
  return http.get(latestSchemaUrl);
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

    return viewModels;
  });

  return latestSchemaReq;
};

export default {
  changeSourceData() {
  },
  getSources(connector) {
    const baseUrl = getBaseBlueprintUrl(connector.options, connector.type);

    // Get all data packages
    // TODO: Change implementation after https://github.com/chmjs/ride-storage-blueprint/issues/40
    return http.get(`${baseUrl}/data-packages`).then((response) => {
      const dataPackage = response.data.dataPackages[0];

      // Take first data package and fetch its latest schema
      return getViewModels(baseUrl, dataPackage.id);
    });
  },
  getSourceData() {
  },
  getSourceSchema(connector, source) {
    const baseUrl = getBaseBlueprintUrl(connector.options, connector.type);
    return getLatestSchema(baseUrl, source.dataPackage).then((result) => {
      const { records, views } = result.data.schema;
      const viewSchema = find(views, { id: source.id });
      const schema = find(records, { id: source.record });

      return { schema: formatSourceSchema(schema, viewSchema) };
    });
  },
};
