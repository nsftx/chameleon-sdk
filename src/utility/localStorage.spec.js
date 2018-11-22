import 'jest-localstorage-mock';
import storage from './localStorage';

describe('localStorage utility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should be supported', () => {
    expect(storage.isSupported).toBeTruthy();
  });

  it('should save data', () => {
    storage.setItem('test', 'testValue');
    expect(storage.getItem('test')).toEqual('testValue');
  });

  it('should save object data', () => {
    storage.setItem('test', 'testValue');
    expect(storage.getItem('test')).toEqual('testValue');
  });

  it('should save get storage keys', () => {
    storage.setItem('test', 'testValue');
    expect(storage.getAllKeys()).toEqual(['test']);
  });

  it('should remove data', () => {
    storage.setItem('test', 'testValue');
    expect(storage.removeItem('test')).toBeFalsy();
  });

  it('should save auth data', () => {
    const authValue = {
      access_token: 'MySecretBearer',
    };

    storage.setItem('auth', JSON.stringify(authValue));
    expect(storage.getAuthData()).toEqual(authValue);
  });

  it('should save auth data and get auth token', () => {
    const authValue = {
      access_token: 'MySecretBearer',
    };

    storage.setItem('auth', JSON.stringify(authValue));
    expect(storage.getAuthToken()).toEqual('MySecretBearer');
  });

  it('should not break when not supported', () => {
    storage.isSupported = false;

    storage.setItem('test', 'testValue');
    expect(storage.getItem('test')).toBeFalsy();

    storage.removeItem('test');
    expect(storage.getItem('test')).toBeFalsy();
  });
});
