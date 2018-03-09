import { isArray, isUndefined, merge, map } from 'lodash';

// Check is global variable registered
const isGlobalAvailable = (dep) => {
  if (dep.indexOf('.') < 0) {
    return !!window[dep];
  }

  // Handle dot notation, e.g. google.maps
  const parts = dep.split('.');
  return !!window[parts[0]] && !!window[parts[0]][parts[1]];
};

const setFlag = (globalDep, prop, value) => {
  merge(window, {
    // eslint-disable-next-line
    __CHAMELEON_MATERIAL_DEPS__: { [globalDep]: { [prop]: value } },
  });
};

// Register & handle interval for global variable check
const startAvailabilityInterval = (dep, resolve, reject) => {
  // eslint-disable-next-line
  const globalDeps = window.__CHAMELEON_MATERIAL_DEPS__;

  const availabilityInterval = setInterval(() => {
    if (isGlobalAvailable(dep)) {
      resolve();
      clearInterval(availabilityInterval);
    } else if (globalDeps[dep].rejected) {
      reject();
      clearInterval(availabilityInterval);
    }
  }, 100);
};

const addDependency = (url, globals) => {
  const type = url.type === 'script' || isUndefined(url.type) ? 'script' : 'link';
  const attr = url.type === 'script' || isUndefined(url.type) ? 'src' : 'href';
  const script = document.createElement(type);

  script.setAttribute(attr, url.src || url);

  if (url.type === 'script' || isUndefined(url.type)) {
    document.body.appendChild(script);
  } else if (url.type === 'link') {
    script.rel = 'stylesheet';
    script.type = 'text/css';
    document.head.appendChild(script);
  }

  return new Promise((resolve, reject) => {
    script.onerror = () => {
      reject();
      setFlag(globals, 'rejected', true);
    };

    script.onload = () => {
      if (type === 'link' || (type !== 'link' && isGlobalAvailable(globals))) {
        // Resolve stylesheets and registered global variables
        resolve();
      } else {
        // Schedule checks for unregistered global variables
        startAvailabilityInterval(globals, resolve, reject);
      }
    };
  });
};

const initDependencies = (url, globals) => {
  const items = isArray(url) ? url : [url];
  const promises = map(items, item => addDependency(item, globals));

  return Promise.all(promises);
};

export default {
  methods: {
    loadDependencies(srcs, dep) {
      // eslint-disable-next-line
      const globalDeps = window.__CHAMELEON_MATERIAL_DEPS__;

      return new Promise((resolve, reject) => {
        if (!globalDeps[dep]) {
          // Start dependency intialization
          setFlag(dep, 'started', true);
          initDependencies(srcs, dep).then(() => {
            resolve();
          }).catch((error) => {
            console.warn('[CV] Script rejected =>', error);
          });
        } else if (isGlobalAvailable(dep)) {
          // Resolve if global vairable is registered
          resolve();
        } else {
          // Schedule checks if global variable is unregistered
          startAvailabilityInterval(dep, resolve, reject);
        }
      });
    },
  },
  beforeMount() {
    // eslint-disable-next-line
    if (!window.__CHAMELEON_MATERIAL_DEPS__) window.__CHAMELEON_MATERIAL_DEPS__ = {};
  },
};
