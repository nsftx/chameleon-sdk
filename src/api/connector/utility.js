import { isNil } from 'lodash';
import { localStorage } from '../../utility';

/* eslint import/prefer-default-export:"off" */
export function getCommonMeta() {
  const token = localStorage.getAuthToken();
  const headers = {};

  if (!isNil(token)) {
    headers.authorization = `Bearer ${token}`;
  }

  return {
    headers,
  };
}
