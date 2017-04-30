export const stubValidator = ({ addResource, addRule, validate }) => {
  const module = () => ({ validate });

  // eslint-disable-next-line
  module.addResource = addResource.returns(module);
  // eslint-disable-next-line
  module.addRule = addRule.returns(module);

  return {
    'gotta-validate': module,
  };
};

export const stubLogger = () => ({
  'lib/logger': () => ({
    finish () {},
    start () {},
    log () {},
    catchLog (func) { return func; },
  }),
});

export const stubInterval = (stub) => {
  const originalSetInterval = setInterval;

  before(() => {
    global.setInterval = stub;
  });

  after(() => {
    global.setInterval = originalSetInterval;
  });
};
