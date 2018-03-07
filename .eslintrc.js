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
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
  }
}
