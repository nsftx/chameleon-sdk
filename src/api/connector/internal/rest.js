/*
Reserved for Ride Core connector.
*/
import http from 'axios';
import { map } from 'lodash';

const getBaseBlueprintUrl = (connectorOptions, connectorType) => {
  const api = connectorType.options.endpoint;
  const blueprintEndpoint = api.blueprint;
  const url = `${blueprintEndpoint}/api/v1/${connectorOptions.space}`;

  return url;
};

const getViewModels = (baseUrl, dataPackageId) => {
  const latestSchemaUrl = `${baseUrl}/data-packages/${dataPackageId}/schema-versions/uncommitted`;
  const viewModelsReq = http.get(latestSchemaUrl).then((result) => {
    const { views } = result.data.schema;

    // Attach necessary data for READ implementation
    const viewModels = map(views, (view) => {
      const viewData = {
        id: view.id,
        name: view.name,
        dataPackage: dataPackageId,
        record: view.rootRecordId,
      };

      return viewData;
    });

    return viewModels;
  });

  return viewModelsReq;
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
  getSourceSchema() {
  },
};
