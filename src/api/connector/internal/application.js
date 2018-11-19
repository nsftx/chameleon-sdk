import { getSavedSources } from '../common';
import { logger } from '../../../utility';

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
        name: 'description',
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

export default {
  getSources(connector) {
    return getSavedSources(connector);
  },
  getSourceData() {
    return true;
  },
  getSourceSchema(connector, source) {
    return new Promise((resolve, reject) => {
      if (sourceSchemas) {
        return resolve(sourceSchemas[source.name]);
      }

      logger.error('Non-existent source schema');
      return reject();
    });
  },
};
