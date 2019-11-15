import { filter, map } from 'lodash';

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
  loadBundles(config) {
    // config example
    // const config = {
    //   bundle: bundle,
    //   scriptType: 'meta',
    //   baseURL: process.env.VUE_APP_ASSETS_BASEURL,
    //   style: false,
    //   script: true
    // };
    let scripts = [];
    let promises = [];
    let styles = [];

    if (config.bundle.scripts) {
      scripts = filter(config.bundle.scripts, script => script.type === config.scriptType);
    }

    if (scripts.length > 0 && config.script) {
      promises = map(scripts, script => addBundleItem(script, 'script', config.bundle.name, config.baseURL));
    }

    if (config.bundle.styles && config.style) {
      styles = map(config.bundle.styles, style => addBundleItem(style, 'link', config.bundle.name, config.baseURL));
    }

    promises = promises.concat(styles);

    return Promise.all(promises);
  },
};
