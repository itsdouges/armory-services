module.exports = {
  extends: ['airbnb-base', 'plugin:flowtype/recommended'],

  parser: 'babel-eslint',

  plugins: ['flowtype', 'mocha'],

  parserOptions: {
    ecmaFeatures: {
      generators: true,
      experimentalObjectRestSpread: true,
    },
  },

  rules: {
    'space-before-function-paren': 'off',
    'comma-dangle': 'off',
    'default-case': 0,
    'global-require': 0,
    'import/no-unresolved': 0,
    'no-duplicate-imports': 'off',
    'import/no-extraneous-dependencies': 0,
    'arrow-body-style': 'off',
    'no-unused-expressions': 'error',
    'no-unused-vars': ['error'],
    'mocha/no-exclusive-tests': 'error',
    'no-unused-expressions': 'off',
  },

  globals: {
    describe: true,
    it: true,
    context: true,
    beforeEach: true,
    afterEach: true,
    expect: true,
    sinon: true,
    proxyquire: true,
    before: true,
    after: true,
    setupTestDb: true,
  },
};
