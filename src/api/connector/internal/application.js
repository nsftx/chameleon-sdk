import { map, pick } from 'lodash';
import { getSavedSources } from '../common';
import { binding, logger } from '../../../utility';

const sourceSchemas = {
  currentApp: {
    name: 'currentApp',
    model: 'CurrentApp',
    actions: ['read'],
    identifier: 'id',
    fields: [
      {
        name: 'id',
        type: 'String',
      },
    ],
    filters: {
      operators: ['eq'],
      fields: {
        id: '*',
      },
    },
  },
  currentUser: {
    name: 'currentUser',
    model: 'CurrentUser',
    actions: ['read'],
    identifier: 'id',
    fields: [
      {
        name: 'id',
        type: 'String',
      },
    ],
    filters: {
      operators: ['eq'],
    },
  },
  pages: {
    name: 'pages',
    model: 'Pages',
    actions: ['read'],
    identifier: 'id',
    fields: [
      {
        name: 'name',
        type: 'String',
      },
      {
        name: 'path',
        type: 'String',
      },
      {
        name: '_id',
        type: 'String',
      },
    ],
    filters: {
      operators: ['eq'],
    },
  },
};

const sourceMeta = {
  currentApp: {
    context: 'registry',
    path: '=$app.id',
    parse(appId) {
      return [{
        id: appId,
      }];
    },
  },
  currentUser: {
    context: 'registry',
    path: '=$app.users',
    parse(users) {
      return map(users, userId => ({
        id: userId,
      }));
    },
  },
  pages: {
    context: 'registry',
    path: '=$app.pages',
    parse(pages) {
      const schemaFields = map(sourceSchemas.pages.fields, field => field.name);

      return map(pages, page => pick(page, schemaFields));
    },
  },
};

export default {
  async getSources(connector) {
    return getSavedSources(connector);
  },
  async getSourceData(connector, source, options) {
    return new Promise((resolve) => {
      const { context, path, parse } = sourceMeta[source.name];

      const data = binding.resolveDynamicValue(path, {
        [context]: options.context[context],
      });

      console.log('DATA', data);

      return resolve({
        [source.name]: {
          items: parse(data),
        },
      });
    });
  },
  async getSourceSchema(connector, source) {
    return new Promise((resolve, reject) => {
      if (sourceSchemas[source.name]) {
        return resolve(sourceSchemas[source.name]);
      }

      logger.error('Non-existent source schema');
      return reject();
    });
  },
};
