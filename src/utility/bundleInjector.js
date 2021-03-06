import { filter, map, indexOf } from 'lodash';

const isGlobalAvailable = global => !!window[global];

const startAvailabilityInterval = (global, resolve) => {
  const availabilityInterval = setInterval(() => {
    if (isGlobalAvailable(global)) {
      resolve(global);
      clearInterval(availabilityInterval);
    }
  }, 100);

  return availabilityInterval;
};

const addBundleItem = (item, type, bundleName, bundleBaseUrl) => {
  const attr = type === 'script' ? 'src' : 'href';
  const itemName = type === 'script' ? item.script : item;
  const itemGlobal = item.global;
  let checkInterval = null;

  const script = document.createElement(type);
  script.setAttribute(attr, `${bundleBaseUrl}/bundles/${bundleName}/latest/${itemName}`);

  if (type === 'script') {
    document.body.appendChild(script);
  } else {
    script.rel = 'stylesheet';
    script.type = 'text/css';
    document.head.appendChild(script);
  }

  return new Promise((resolve, reject) => {
    script.onload = () => {
      if (type === 'link' || isGlobalAvailable(itemGlobal)) {
        resolve(itemGlobal);
      } else {
        checkInterval = startAvailabilityInterval(itemGlobal, resolve);
      }
    };

    script.onerror = () => {
      if (checkInterval) clearInterval(checkInterval);
      reject(bundleName);
    };
  });
};

export default {
  /**
    * Load bundles method.
    * @param {object} bundle - Bundle object that contains bundle information.
    * @param {object} config - Config object width properties:
    * scripts, baseURL, styles.
    * @return {object} promise.
    */
  loadBundles(bundle, config) {
    let scripts = [];
    let promises = [];
    let styles = [];

    if (bundle.scripts) {
      scripts = filter(bundle.scripts, script => indexOf(config.scripts, script.type) > -1);
    }

    if (scripts.length > 0) {
      promises = map(scripts, script => addBundleItem(script, 'script', bundle.name, config.baseURL));
    }

    if (bundle.styles && config.styles) {
      styles = map(bundle.styles, style => addBundleItem(style, 'link', bundle.name, config.baseURL));
    }

    promises = promises.concat(styles);

    return Promise.all(promises);
  },
};
