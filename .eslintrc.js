module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'linebreak-style': 0,
    'no-undef': 0,
    'import/no-extraneous-dependencies': 0,
    'no-console': 0,
    'no-use-before-define': 0,
    'no-unused-vars': 0,
    'max-len': 0,
    'no-return-await': 0,
    'consistent-return': 0,
    'max-classes-per-file': 0,
  },
};
