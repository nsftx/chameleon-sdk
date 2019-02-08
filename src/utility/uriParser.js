export default {
  encode(params) {
    return Object.keys(params).map((key) => {
      const encoded = `${key}=${encodeURIComponent(params[key])}`;

      return encoded;
    }).join('&');
  },
  joinUrl(baseUrl, ...urlParts) {
    // Remove ending slash in base url
    const parsedBase = baseUrl.replace(/[/]+$/, '');

    // Strip start and end slashes for each url part
    const parsedParts = urlParts.map(part => part.replace(/^\/|\/$/g, ''));

    return `${parsedBase}/${parsedParts.join('/')}`;
  },
};
