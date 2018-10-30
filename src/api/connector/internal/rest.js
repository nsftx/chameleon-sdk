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

// Attach necessary data for READ implementation
const formatViewModel = (viewModel, dataPackageId) => {
  const viewData = {
    id: viewModel.id,
    name: viewModel.name,
    dataPackage: dataPackageId,
    record: viewModel.rootRecordId,
  };

  return viewData;
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
      const latestSchemaUrl = `${baseUrl}/data-packages/${dataPackage.id}/schema-versions/uncommitted`;

      // Take first data package and fetch its latest schema
      return http.get(latestSchemaUrl).then((result) => {
        const { views } = result.data.schema;
        const viewModels = map(views, view => formatViewModel(view, dataPackage.id));

        return viewModels;
      });
    });
  },
  getSourceData() {
  },
  getSourceSchema() {
  },
};
