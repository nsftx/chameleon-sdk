export default {
  encode(params) {
    return Object.keys(params).map((key) => {
      const encoded = `${key}=${encodeURIComponent(params[key])}`;

      return encoded;
    }).join('&');
  },
};
