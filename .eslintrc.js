module.exports = {
  extends: [
    'airbnb-base',
    'plugin:flowtype/recommended',
  ],

  parser: 'babel-eslint',

  plugins: [
    'flowtype',
    'mocha',
  ],

  parserOptions: {
    ecmaFeatures: {
      generators: true,
      experimentalObjectRestSpread: true,
    },
  },

  rules: {
    'space-before-function-paren': [2, 'always'],
    'comma-dangle': ['error', 'always-multiline'],
    'default-case': 0,
    'global-require': 0,
    'import/no-unresolved': 0,
    'import/no-extraneous-dependencies': 0,
    'arrow-body-style': 0,
    'no-unused-expressions': 0,
    'no-unused-vars': ['error', {
      varsIgnorePattern: '(.*\.\.\.)',
    }],

    'mocha/no-exclusive-tests': 'error',
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
