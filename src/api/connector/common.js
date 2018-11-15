import { isNil } from 'lodash';
import { localStorage } from '../../utility';

/* eslint import/prefer-default-export:"off" */
export function getCommonMeta(connector) {
  const token = localStorage.getAuthToken();
  const headers = {};

  if (!isNil(token)) {
    headers.authorization = `Bearer ${token}`;
  }

  if (connector) {
    headers['X-NSFT-CONNECTOR-INSTANCE'] = connector.id;
  }

  return {
    headers,
  };
}

export function getSavedSources(connector) {
  return new Promise((resolve) => {
    resolve(connector.sources);
  });
}
