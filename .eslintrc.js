module.exports = {
  root: true,
  env: {
    browser: true,
  },
  extends: 'airbnb-base',
  rules: {
    'no-console': 'off',
    'import/extensions': ['error', 'always', {
      'js': 'never',
    }],
    'import/no-extraneous-dependencies': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-underscore-dangle': ['error', {
      allow: ['_schema', '_options', '_reactions', '_id'],
    }],
  }
}
