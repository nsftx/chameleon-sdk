/*
We are using babel this way since babelrc or babel package
settings are merged in projects using this lib.
*/
module.exports = require('babel-jest').createTransformer({
  presets: ['babel-preset-env'],
  plugins: [
    ['transform-runtime', {
      polyfill: false,
      regenerator: true,
    }],
  ],
});
