import bundleInjector from './bundleInjector';

describe('bundleInjector utility', () => {
  it('Should load bundles', () => {
    const bundle = {
      name: 'material',
      namespace: 'c-',
      version: 156,
      styles: [
        'bundle.min.css',
      ],
      scripts: [
        {
          script: 'bundle.min.js',
          type: 'components',
          global: '__CHAMELEON_MATERIAL__',
        },
        {
          script: 'bundle.meta.js',
          type: 'meta',
          global: '__CHAMELEON_MATERIAL_META__',
        },
      ],
      helpPath: 'help',
      plugins: {
        vuetify: {
          components: [
            'VDataTable',
            'VTextarea',
            'VTreeview',
            'VDatePicker',
          ],
        },
      },
    };
    const config = {
      scripts: ['meta', 'components'],
      baseURL: 'https://storage.googleapis.com/chameleon-storage',
    };
    return bundleInjector.loadBundles(bundle, config).then((data) => {
      // eslint-disable-next-line
      expect(data).toEqual(["__CHAMELEON_MATERIAL__", "__CHAMELEON_MATERIAL_META__"]);
    });
  });
});
