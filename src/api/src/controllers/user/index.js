const password = require('password-hash-and-salt');

const CharacterController = require('../character');

function userControllerFactory (models, createValidator, gw2Api) {
  createValidator.addResource({
    name: 'users',
    mode: 'create',
    rules: {
      alias: ['required', 'unique-alias', 'no-white-space', 'min5'],
      email: ['required', 'unique-email', 'no-white-space'],
      password: ['required', 'ezpassword', 'no-white-space'],
    },
  })
  .addResource({
    name: 'users',
    mode: 'update-password',
    rules: {
      email: 'required',
      currentPassword: ['required'],
      password: ['required', 'ezpassword', 'no-white-space'],
    },
  });

  function hashPassword (userPassword) {
    return new Promise((resolve, reject) => {
      password(userPassword).hash((error, hash) => {
        if (error) {
          return reject(error);
        }

        return resolve(hash);
      });
    });
  }

  function verifyHash (hash, userPassword) {
    return new Promise((resolve, reject) => {
      password(userPassword).verifyAgainst(hash, (error, verified) => {
        if (error) {
          return reject(error);
        }

        if (!verified) {
          return reject('Bad password');
        }

        return resolve();
      });
    });
  }

  function create (user) {
    const validator = createValidator({
      resource: 'users',
      mode: 'create',
    });

    return validator.validate(user)
      .then(() => hashPassword(user.password))
      .then((passwordHash) => {
        const newUser = Object.assign({}, user, {
          passwordHash,
        });

        return models.User.create(newUser);
      });
  }

  function read (email) {
    return models
      .User
      .findOne({ where: { email } })
      .then((data) => data.dataValues)
      .then((data) => {
        const characterController = new CharacterController(models, gw2Api);

        return characterController
          .list(email)
          .then((characters) => Object.assign({}, data, {
            characters,
          }));
      });
  }

  function readPublic (alias) {
    return models
      .User
      .findOne({ where: { alias } })
      .then((result) => {
        if (!result) {
          return Promise.reject('No user was found.');
        }

        return result.dataValues;
      })
      .then((data) => {
        const characterController = new CharacterController(models, gw2Api);

        return characterController
          .list(null, data.alias)
          .then((characters) => ({
            alias: data.alias,
            createdAt: data.createdAt,
            characters,
          }));
      });
  }

  function updatePassword (user) {
    const validator = createValidator({
      resource: 'users',
      mode: 'update-password',
    });

    return validator
      .validate(user)
      .then(() => read(user.email))
      .then((userData) => {
        /* eslint arrow-body-style:0 */
        return verifyHash(userData.passwordHash, user.currentPassword)
        .then(() => user.password);
      })
      .then((newPassword) => hashPassword(newPassword))
      .then((passwordHash) =>
        models.User.update({
          passwordHash,
        }, {
          where: {
            email: user.email,
          },
        }));
  }

  function forgotMyPasswordStart () {

  }

  function forgotMyPasswordFinish () {

  }

  return {
    create,
    read,
    readPublic,
    updatePassword,
    forgotMyPasswordStart,
    forgotMyPasswordFinish,
  };
}

module.exports = userControllerFactory;
