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
  getSources(connector, { savedOnly }) {
    console.log(connector, savedOnly);

    return true;
  },
  getSourceData(connector, source) {
    console.log(connector, source);

    return true;
  },
  getSourceSchema(connector, source) {
    return new Promise((resolve) => {
      resolve(sourceSchemas[source.name]);
    });
  },
};
