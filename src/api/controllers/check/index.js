export default function CheckController (createValidator) {
  createValidator.addResource({
    name: 'check',
    mode: 'gw2-token',
    rules: {
      token: ['valid-gw2-token', 'required', 'no-white-space'],
    },
  })
  .addResource({
    name: 'check',
    mode: 'email',
    rules: {
      email: ['unique-email', 'required', 'no-white-space'],
    },
  })
  .addResource({
    name: 'check',
    mode: 'alias',
    rules: {
      alias: ['unique-alias', 'required', 'no-white-space', 'min5'],
    },
  });

  function validateGw2Token (token) {
    const validator = createValidator({
      resource: 'check',
      mode: 'gw2-token',
    });

    return validator.validate(token);
  }

  function valdiateEmail (email) {
    const validator = createValidator({
      resource: 'check',
      mode: 'email',
    });

    return validator.validate(email);
  }

  function validateAlias (alias) {
    const validator = createValidator({
      resource: 'check',
      mode: 'alias',
    });

    return validator.validate(alias);
  }

  return {
    gw2Token: validateGw2Token,
    email: valdiateEmail,
    alias: validateAlias,
  };
}
