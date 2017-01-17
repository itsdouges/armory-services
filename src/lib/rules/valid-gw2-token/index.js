function validGw2Token (name, val, dependencies) {
  if (!val) {
    return Promise.resolve();
  }

  function checkGw2Api (token) {
    const authCheck = dependencies.axios.get(`${dependencies.env.gw2.endpoint}v2/tokeninfo`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      const permissions = response.data.permissions;
      const hasCharacters = permissions.filter((item) => {
        return item === 'characters' || item === 'builds';
      });

      if (hasCharacters.length !== 2) {
        return {
          property: name,
          message: 'needs characters and builds permission',
        };
      }

      return undefined;
    });

    const duplicateCheck = dependencies.axios.get(`${dependencies.env.gw2.endpoint}v2/account`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      const accountName = response.data.name;

      return dependencies.models
          .Gw2ApiToken
          .findOne({
            where: {
              accountName,
            },
          })
          .then((item) => {
            if (item) {
              return {
                property: name,
                message: `key for ${accountName} already exists`,
              };
            }

            return undefined;
          });
    });

    return Promise.all([authCheck, duplicateCheck])
      .then(([authResponse, duplicateResponse]) => {
        return authResponse || duplicateResponse;
      }, () => Promise.resolve({
        property: name,
        message: 'invalid token',
      }));
  }

  return dependencies.models
    .Gw2ApiToken
    .findOne({ where: { token: val } })
    .then((item) => {
      if (item) {
        return {
          property: name,
          message: 'is already being used',
        };
      }

      return checkGw2Api(val);
    });
}

module.exports = validGw2Token;
