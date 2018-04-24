/*
This mixin provides `loadDependencies` method that checks if
required library for component is loaded (for example youtube API).
Mixin sets global flags to make sure dependencies are loaded only once.
*/
import {
  get,
  isArray,
  isNil,
  isString,
  merge,
  map,
} from 'lodash';

import { logger } from '../utility';

let globalDependencies = null;

const isGlobalAvailable = (dependency) => {
  if (dependency.indexOf('.') < 0) {
    return !isNil(window[dependency]);
  }

  return !isNil(get(window, dependency));
};

const setGlobal = (context) => {
  const dependencies = context.dependableBundle || 'global';
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

const addDependency = (dependency, globals) => {
  const type = dependency.type === 'script' || isNil(dependency.type) ? 'script' : 'link';
  const attr = dependency.type === 'script' || isNil(dependency.type) ? 'src' : 'href';
  const resource = document.createElement(type);
  const dependencySource = isString(dependency) ? dependency : dependency.src;

  resource.setAttribute(attr, dependencySource);

  if (type === 'script') {
    if (dependency.async) {
      resource.setAttribute('async', true);
    }

    document.body.appendChild(resource);
  } else if (dependency.type === 'link') {
    resource.setAttribute('rel', 'stylesheet');
    resource.setAttribute('type', 'text/css');
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

const initDependencies = (dependencies, globals) => {
  const items = isArray(dependencies) ? dependencies : [dependencies];
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
            logger.warn('Script rejected', error);
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
  beforeCreate() {
    setGlobal(this);
  },
};
