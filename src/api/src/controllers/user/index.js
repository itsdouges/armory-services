const password = require('password-hash-and-salt');
const moment = require('moment');

const emailClient = require('../../lib/email');
const CharacterController = require('../character');
const getUserIdByEmail = require('../../lib/get-user-info').getUserIdByEmail;
const config = require('../../../env');
const parseAccountName = require('../../lib/user').parseAccountName;

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
  })
  .addResource({
    name: 'users',
    mode: 'forgot-my-password',
    rules: {
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
      .findOne({
        where: { alias },
        include: [{
          all: true,
        }],
      })
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
            accountName: parseAccountName(data),
            alias: data.alias,
            createdAt: data.createdAt,
            characters,
          }));
      });
  }

  function changePassword (id, newPassword) {
    return hashPassword(newPassword)
      .then((passwordHash) => {
        return models.User.update({
          passwordHash,
        }, {
          where: {
            id,
          },
        });
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
        .then(() => ({
          password: user.password,
          id: userData.id,
        }));
      })
      .then((data) => changePassword(data.id, data.password));
  }

  function forgotMyPasswordStart (email) {
    return getUserIdByEmail(models, email)
      .then((userId) => {
        return models.UserReset.create({
          UserId: userId,
          expires: moment().add(config.PASSWORD_RESET_TIME_LIMIT, 'minutes'),
        });
      })
      .then(({ id }) => {
        return emailClient.send({
          subject: 'Forgot My Password',
          to: email,
          html: `
<h2>Forgot My Password</h2>

Hi, you requested to reset your password.
Please <a href="https://gw2armory.com/forgot-my-password?token=${id}"> click here to finish
resetting your password</a>.
<br />
<br />
Optionally copy this into the token reset field: ${id}
<br />
<br />
Cheers,<br />
Guild Wars 2 Armory
<br /><br />
<small>Please don't reply to this email, you won't get a response.</small>
`,
        });
      });
  }

  function forgotMyPasswordFinish (guid, newPassword) {
    return models.UserReset.findOne({
      where: {
        id: guid,
      },
    })
    .then((row) => {
      if (!row) {
        return Promise.reject('Reset doesn\'t exist.');
      }

      if (moment(row.expires).isBefore(moment()) || row.used) {
        return Promise.reject('Reset has expired.');
      }

      return createValidator({
        resource: 'users',
        mode: 'forgot-my-password',
      })
      .validate({
        password: newPassword,
      })
      .then(() => changePassword(row.UserId, newPassword))
      .then(() => models.UserReset.update({
        used: true,
      }, {
        where: {
          id: row.id,
        },
      }));
    });
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
