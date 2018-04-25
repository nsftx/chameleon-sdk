const isSupported = () => {
  const test = 'localStorage';

  try {
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

export default {
  isSupported: isSupported(),
  getAuthData() {
    let auth = null;
    const authStorage = this.getItem('auth');
    if (authStorage) {
      auth = JSON.parse(authStorage);
    }

    return auth;
  },
  getAuthToken() {
    let token;
    const authStorage = this.getItem('auth');
    if (authStorage) {
      const auth = JSON.parse(authStorage);
      token = auth.access_token;
    }

    return token;
  },
  getAuthHeader() {
    let header;
    const authStorage = this.getItem('auth');
    if (authStorage) {
      const auth = JSON.parse(authStorage);
      if (auth.token_type === 'bearer') {
        header = `Bearer ${auth.access_token}`;
      }
    }

    return header;
  },
  getItem(key) {
    if (this.isSupported) {
      return localStorage.getItem(key);
    }

    return null;
  },
  removeItem(key) {
    if (this.isSupported) {
      localStorage.removeItem(key);
      return this.getItem(key);
    }

    return null;
  },
  setItem(key, value) {
    if (this.isSupported) {
      localStorage.setItem(key, value);
      return this.getItem(key);
    }

    return null;
  },
};
