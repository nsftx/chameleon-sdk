import bundleInjector from './bundleInjector';

describe('bundleInjector utility', () => {
  const materialBundle = {
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
        ],
      },
    },
  };

  const chartsBundle = {
    name: 'charts',
    namespace: 'cc-',
    version: 34,
    scripts: [
      {
        script: 'bundle.js',
        type: 'components',
        global: '__CHAMELEON_CHARTS__',
      },
      {
        script: 'bundle.meta.js',
        type: 'meta',
        global: '__CHAMELEON_CHARTS_META__',
      },
    ],
    helpPath: 'help',
  };

  const sevenBundle = {
    name: 'seven',
    namespace: 's-',
    version: 165,
    scripts: [
      {
        script: 'bundle.js',
        type: 'components',
        global: '__CHAMELEON_SEVEN__',
      },
      {
        script: 'bundle.meta.js',
        type: 'meta',
        global: '__CHAMELEON_SEVEN_META__',
      },
    ],
    helpPath: 'help',
    styles: [
      'index.css',
    ],
  };

  const teamBundle = {
    name: 'team',
    namespace: 'ct-',
    version: 38,
    styles: [
      'index.css',
    ],
    scripts: [
      {
        script: 'bundle.js',
        type: 'components',
        global: '__CHAMELEON_TEAM__',
      },
      {
        script: 'bundle.meta.js',
        type: 'meta',
        global: '__CHAMELEON_TEAM_META__',
      },
    ],
    plugins: {
      vuetify: {
        components: [
          'VContainer',
          'VCard',
          'VCardTitle',
          'VCardActions',
          'VLayout',
          'VIcon',
          'VImg',
          'VFlex',
          'VTextField',
          'VTabs',
          'VTab',
          'VTabItem',
          'VSpacer',
        ],
      },
    },
  };

  const visionBundle = {
    name: 'vision',
    namespace: 'cv-',
    version: 7,
    styles: [
      'index.css',
    ],
    scripts: [
      {
        script: 'bundle.js',
        type: 'components',
        global: '__CHAMELEON_VISION__',
      },
      {
        script: 'bundle.meta.js',
        type: 'meta',
        global: '__CHAMELEON_VISION_META__',
      },
    ],
    helpPath: 'help',
  };
  const config = {
    scripts: ['meta', 'components'],
    baseURL: 'https://storage.googleapis.com/chameleon-storage',
    styles: true,
  };
  const bundles = [
    {
      name: 'material', data: materialBundle,
    },
    {
      name: 'charts', data: chartsBundle,
    },
    {
      name: 'seven', data: sevenBundle,
    },
    {
      name: 'team', data: teamBundle,
    },
    {
      name: 'vision', data: visionBundle,
    }];
  bundles.forEach((bundle) => {
    it(`Should return ${bundle.name} bundle and bundle.meta scripts; undefined for styles`,
      () => bundleInjector.loadBundles(bundle.data, config).then((data) => {
        const expected = [`__CHAMELEON_${bundle.name.toUpperCase()}__`, `__CHAMELEON_${bundle.name.toUpperCase()}_META__`, undefined];
        if (bundle.name === 'charts') expected.pop();
        expect(data).toEqual(expected);
      }));
    it(`Should return only ${bundle.name} styles`, () => {
      const materialBundleStyles = { ...bundle.data };
      materialBundleStyles.scripts = [];
      return bundleInjector.loadBundles(materialBundleStyles, config).then((data) => {
        const expected = bundle.name === 'charts' ? [] : [undefined];
        expect(data).toEqual(expected);
      });
    });
    it(`Should return only ${bundle.name} scripts`, () => {
      const noStyleConfig = { ...config };
      noStyleConfig.styles = false;
      return bundleInjector.loadBundles(bundle.data, noStyleConfig).then((data) => {
        expect(data).toEqual([`__CHAMELEON_${bundle.name.toUpperCase()}__`, `__CHAMELEON_${bundle.name.toUpperCase()}_META__`]);
      });
    });
    it(`Should return only ${bundle.name} meta scripts`, () => {
      const metaConfig = { ...config };
      metaConfig.scripts = ['meta'];
      metaConfig.styles = false;
      return bundleInjector.loadBundles(bundle.data, metaConfig).then((data) => {
        expect(data).toEqual([`__CHAMELEON_${bundle.name.toUpperCase()}_META__`]);
      });
    });
    it(`Should return only ${bundle.name} component scripts`, () => {
      const componentConfig = { ...config };
      componentConfig.scripts = ['components'];
      componentConfig.styles = false;
      return bundleInjector.loadBundles(bundle.data, componentConfig).then((data) => {
        expect(data).toEqual([`__CHAMELEON_${bundle.name.toUpperCase()}__`]);
      });
    });
  });
});
