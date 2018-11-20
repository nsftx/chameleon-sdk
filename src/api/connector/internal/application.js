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
      {
        name: 'name',
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
    identifier: 'email',
    fields: [
      {
        name: 'email',
        type: 'String',
      },
    ],
    filters: {
      operators: ['eq'],
    },
  },
  pages: {
    name: 'pages',
    model: 'Page',
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
  themes: {
    name: 'themes',
    model: 'Theme',
    actions: ['read'],
    identifier: 'id',
    fields: [
      {
        name: 'name',
        type: 'String',
      },
      {
        name: 'value',
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
    path: '=$app',
    parse(app) {
      return [{
        id: app.id,
        name: app.name,
      }];
    },
  },
  currentUser: {
    context: 'registry',
    path: '=$app.users',
    parse(email) {
      return [{
        email,
      }];
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
  themes: {
    context: 'registry',
    path: '=$themes',
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

      return resolve({
        [source.name]: {
          items: parse ? parse(data) : data,
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
