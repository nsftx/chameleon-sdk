/*
This mixin provides `loadDependencies` method that checks if
required library for component is loaded (for example youtube API).
Mixin sets global flags to make sure dependencies are loaded only once.
*/
import {
  get,
  isArray,
  isNil,
  merge,
  map,
} from 'lodash';

let globalDependencies = null;

const isGlobalAvailable = (dependency) => {
  if (dependency.indexOf('.') < 0) {
    return !isNil(window[dependency]);
  }

  return !isNil(get(window, dependency));
};

const setGlobal = (context) => {
  const dependencies = context.dependableBundle || 'material';
  globalDependencies = `__CHAMELEON_${dependencies.toUpperCase()}_DEPS__`;

  window[globalDependencies] = window[globalDependencies] || {};
};

const setFlag = (global, globalProperty, value) => {
  merge(window[globalDependencies], {
    [global]: {
      [globalProperty]: value,
    },
  });
};

const startAvailabilityInterval = (dependency, resolve, reject) => {
  const availabilityInterval = setInterval(() => {
    if (isGlobalAvailable(dependency)) {
      resolve();
      setFlag(dependency, 'loading', false);
      clearInterval(availabilityInterval);
    } else if (window[globalDependencies][dependency].rejected) {
      reject();
      clearInterval(availabilityInterval);
    }
  }, 100);
};

const addDependency = (url, globals) => {
  const type = url.type === 'script' || isNil(url.type) ? 'script' : 'link';
  const attr = url.type === 'script' || isNil(url.type) ? 'src' : 'href';
  const resource = document.createElement(type);

  resource.setAttribute(attr, url.src || url);

  if (type === 'script') {
    document.body.appendChild(resource);
  } else if (url.type === 'link') {
    resource.rel = 'stylesheet';
    resource.type = 'text/css';
    document.head.appendChild(resource);
  }

  return new Promise((resolve, reject) => {
    resource.onerror = () => {
      setFlag(globals, 'rejected', true);
      reject();
    };

    resource.onload = () => {
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
    loadDependencies(sources, dependency) {
      return new Promise((resolve, reject) => {
        if (!window[globalDependencies][dependency]) {
          // Start dependency intialization
          setFlag(dependency, 'loading', true);
          initDependencies(sources, dependency).then(() => {
            resolve();
            setFlag(dependency, 'loading', false);
          }).catch((error) => {
            // eslint-disable-next-line
            console.warn('[CSDK] Script rejected =>', error);
          });
        } else if (isGlobalAvailable(dependency)) {
          // Resolve if global vairable is registered
          setFlag(dependency, 'loading', false);
          resolve();
        } else {
          // Schedule checks if global variable is unregistered
          startAvailabilityInterval(dependency, resolve, reject);
        }
      });
    },
  },
  beforeMount() {
    setGlobal(this);
  },
};
