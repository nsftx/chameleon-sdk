/*
Reserved for Ride Core connector.
*/
import http from 'axios';
import {
  each,
  filter,
  find,
  isArray,
  keyBy,
  map,
  has,
  omit,
  forIn,
  toLower,
  uniq,
} from 'lodash';
import { uriParser } from '../../../utility';

const formatSourceSchema = (record, view) => {
  const formatted = map(view.fields, (field) => {
    const viewField = field;
    viewField.name = field.displayName;

    if (viewField.dependencyPath) {
      viewField.type = 'relation';
      return viewField;
    }

    const fieldSchema = find(record.fields, { id: field.displayFieldId });
    fieldSchema.name = field.displayName;

    viewField.type = fieldSchema.type;

    return viewField;
  });

  const filteredFields = filter(formatted, field => field.type !== 'primary');

  return filteredFields;
};

const formatResponse = (response) => {
  const responseMetadataFields = response.metadata.schema.fields;
  const fields = response.data;
  const formatedResponse = { metadata: omit(response.metadata, ['schema']), data: [] };
  let formatedField;

  map(fields, (field) => {
    formatedField = {};

    forIn(field, (value, key) => {
      if (has(responseMetadataFields, key)) {
        formatedField[responseMetadataFields[key].displayName] = value;
      }
    });

    formatedResponse.data.push(formatedField);
  });

  return formatedResponse;
};

const getBaseUrl = (connectorOptions, connectorType, type) => {
  const api = connectorType.options.endpoint;
  const serviceEndpoint = api[type];
  const spaceIdentifier = type === 'blueprint' ? `spaces/${connectorOptions.space}` : connectorOptions.space;
  const url = `${serviceEndpoint}/${spaceIdentifier}`;

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

const getInstalledVersions = (baseUrl, versions) => {
  const url = `${baseUrl}/installed-schema-versions`;
  const params = {
    versionIds: versions.join(','),
  };

  return http.get(url, {
    params,
  }).then((response) => {
    const result = response.data;
    return result.installedSchemaVersions;
  });
};

const getLatestSchema = (baseUrl, dataPackageId) => {
  const latestSchemaUrl = `${baseUrl}/data-packages/${dataPackageId}/schema-versions/uncommitted`;
  return http.get(latestSchemaUrl).then(response => response.data);
};

const getSourceDataReqDefinition = (connector, source) => {
  const baseUrl = getBaseUrl(
    connector.options,
    connector.type,
    'read',
  );

  const fields = map(source.schema, field => field.id);
  const url = `${baseUrl}/schema-versions/${source.meta.schemaVersion}/records/${source.meta.record}/instances`;
  const params = {
    viewId: source.id,
    fields: JSON.stringify(fields),
    includeFieldMetadata: true,
  };

  if (source.filters && source.filters.length > 0) {
    params.filters = JSON.stringify(source.filters);
  }

  return {
    url,
    params,
  };
};

const getSourceSeedReqDefinition = (connector, source, options) => {
  const api = connector.type.options.endpoint.read;
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

  return {
    url: `${api}/misc/seed`,
    params,
  };
};

const formatViewModels = (views) => {
  // Attach necessary data for READ & WRITE implementation
  const viewModels = map(views, (view) => {
    const viewData = {
      id: view.id,
      name: view.name,
      model: view.name,
      meta: {
        dataPackage: view.dataPackageId,
        dataPackageName: view.dataPackageName,
        record: view.rootRecordId,
        schemaVersion: view.versionId,
        schemaTag: view.versionTag,
      },
    };

    return viewData;
  });

  return keyBy(viewModels, item => item.id);
};

const getSavedViewModels = (viewModels, connector, baseUrl) => {
  const missingVersions = [];
  const result = map(connector.sources, (item) => {
    const source = item;
    const sourceVersion = source.meta.schemaVersion;
    const existsInNew = viewModels[source.id];
    const versionChanged = existsInNew
      ? existsInNew.meta.schemaVersion !== sourceVersion : true;

    source.disabled = !existsInNew;

    if (versionChanged && existsInNew) {
      source.meta.schemaVersions = [{
        schemaVersion: existsInNew.meta.schemaVersion,
        schemaTag: existsInNew.meta.schemaTag,
      }];
    }

    if (!existsInNew || versionChanged) {
      missingVersions.push(sourceVersion);
    }

    return source;
  });

  if (missingVersions.length === 0) {
    return Promise.resolve(result);
  }

  return getInstalledVersions(baseUrl, uniq(missingVersions)).then((versions) => {
    const finalResult = map(result, (item) => {
      const source = item;

      const installedVersion = find(versions, {
        schemaVersion: { versionId: source.meta.schemaVersion },
      });
      const installedSource = installedVersion
        && find(installedVersion.schemaVersion.schema.views, { id: source.id });

      source.installed = !!installedVersion && !!installedSource;
      if (source.installed) {
        source.meta.schemaTag = installedVersion.schemaVersion.versionTag;
      }

      return source;
    });

    return finalResult;
  });
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
  getSources(connector, { savedOnly }) {
    const baseUrl = getBaseUrl(
      connector.options,
      connector.type,
      'blueprint',
    );

    // Get available view models from all data packages in space
    return http.get(`${baseUrl}/available-view-models`, {
      params: {
        types: ['uncommitted', 'foreign'].join(','),
      },
    }).then((response) => {
      const { viewModels } = response.data;
      const formattedViewModels = formatViewModels(viewModels);

      if (savedOnly) {
        return getSavedViewModels(formattedViewModels, connector, baseUrl);
      }

      return formattedViewModels;
    });
  },
  getSourceData(connector, source, options) {
    const isSeed = options.seed;
    let requestDefinition;

    if (isSeed) {
      requestDefinition = getSourceSeedReqDefinition(connector, source, options);
    } else {
      requestDefinition = getSourceDataReqDefinition(connector, source);
    }

    return http.get(requestDefinition.url, {
      params: requestDefinition.params,
      paramsSerializer: uriParser.encode,
    }).then((response) => {
      const result = isSeed ? response.data : formatResponse(response.data);

      return {
        [source.name]: {
          items: result.data,
          pagination: result.metadata,
        },
      };
    });
  },
  getSourceSchema(connector, source) {
    let schemaRequest;
    const baseUrl = getBaseUrl(
      connector.options,
      connector.type,
      'blueprint',
    );

    if (source.installed && source.disabled) {
      schemaRequest = getInstalledVersions(baseUrl, [source.meta.schemaVersion]);
    } else {
      schemaRequest = getLatestSchema(baseUrl, source.meta.dataPackage);
    }

    return schemaRequest.then((response) => {
      let result = isArray(response) ? response[0] : response;

      if (result && result.schemaVersion) result = result.schemaVersion;

      const { records, views } = result.schema;
      const viewSchema = find(views, { id: source.id });
      const schema = find(records, { id: source.meta.record });

      return {
        id: source.id,
        schema: formatSourceSchema(schema, viewSchema),
        meta: source.meta,
      };
    });
  },
};
