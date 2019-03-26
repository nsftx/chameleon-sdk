import { each, isArray } from 'lodash';

export default {
  encode(params) {
    const queryParams = new URLSearchParams();

    each(params, (paramValue, key) => {
      if (isArray(paramValue)) { // multi-value query parameter
        each(paramValue, (paramMultiValue) => {
          queryParams.append(key, paramMultiValue);
        });
      } else {
        queryParams.append(key, paramValue);
      }
    });

    return queryParams.toString();
  },
  joinUrl(baseUrl, ...urlParts) {
    // Remove ending slash in base url
    const parsedBase = baseUrl.replace(/[/]+$/, '');

    // Strip start and end slashes for each url part
    const parsedParts = urlParts.map(part => part.replace(/^\/|\/$/g, ''));

    return `${parsedBase}/${parsedParts.join('/')}`;
  },
};
