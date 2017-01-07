// @flow

import type { Models, User } from 'flowTypes';

import password from 'password-hash-and-salt';
import moment from 'moment';
import _ from 'lodash';
import createValidator from 'gotta-validate';

import * as guildService from 'lib/services/guild';
import emailClient from 'lib/email';
import { getUserIdByEmail } from 'lib/services/user';
import { parseAccountName } from 'lib/user';
import config from 'config';
import { list } from 'lib/services/character';


export default function userControllerFactory (models: Models) {
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

  async function hashPassword (userPassword) {
    return new Promise((resolve, reject) => {
      password(userPassword).hash((error, hash) => {
        if (error) {
          return reject(error);
        }

        return resolve(hash);
      });
    });
  }

  async function verifyHash (hash, userPassword) {
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

  type CreateUser = User & {
    password: string,
  };

  async function create (user: CreateUser) {
    const validator = createValidator({
      resource: 'users',
      mode: 'create',
    });

    await validator.validate(user);
    const passwordHash = await hashPassword(user.password);

    return await models.User.create({
      ...user,
      passwordHash,
    });
  }

  async function read (email: string) {
    const data = await models.User.findOne({ where: { email } });
    const characters = await list(models, { email });

    return {
      ...(data && data.dataValues),
      characters,
    };
  }

  type ReadPublicOptions = {
    email: string,
    ignorePrivacy: boolean,
  };

  async function readPublic (alias: string, { email, ignorePrivacy }: ReadPublicOptions = {}) {
    const dbUser = await models.User.findOne({
      where: { alias },
      include: [{
        all: true,
      }],
    });

    if (!dbUser) {
      return Promise.reject('No user was found.');
    }

    const data = dbUser.dataValues;
    const primaryToken = _.find(data.gw2_api_tokens, ({ primary }) => primary);

    const characters = await list(models, { alias: data.alias, email, ignorePrivacy });

    const user = {
      accountName: parseAccountName(data),
      alias: data.alias,
      createdAt: data.createdAt,
      characters,
      ..._.pick(_.get(primaryToken, 'dataValues'), [
        'alias',
        'created',
        'world',
        'access',
        'commander',
        'fractalLevel',
        'dailyAp',
        'monthlyAp',
        'wvwRank',
        'guilds',
      ]),
    };

    let guilds = [];

    if (user.guilds) {
      const promises = user.guilds.split(',').map((id) => {
        return guildService.read(models, { id });
      });

      guilds = await Promise.all(promises);
      guilds = guilds.filter((guild) => !!guild).map((guild) => _.pick(guild, [
        'id',
        'tag',
        'name',
      ]));
    }

    return {
      ...user,
      guilds,
    };
  }

  async function changePassword (id, newPassword) {
    const passwordHash = await hashPassword(newPassword);
    await models.User.update({
      passwordHash,
    }, {
      where: {
        id,
      },
    });
  }

  type UpdateUser = {
    email: string,
    currentPassword: string,
    password: string,
  };

  async function updatePassword (user: UpdateUser) {
    const validator = createValidator({
      resource: 'users',
      mode: 'update-password',
    });

    await validator.validate(user);
    const userData = await read(user.email);

    await verifyHash(userData.passwordHash, user.currentPassword);
    await changePassword(userData.id, user.password);
  }

  async function forgotMyPasswordStart (email: string) {
    const userId = await getUserIdByEmail(models, email);
    const { id } = await models.UserReset.create({
      UserId: userId,
      expires: moment().add(config.PASSWORD_RESET_TIME_LIMIT, 'minutes'),
    });

    await emailClient.send({
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
  }

  async function forgotMyPasswordFinish (guid: string, newPassword: string) {
    const row = await models.UserReset.findOne({
      where: {
        id: guid,
      },
    });

    if (!row) {
      return Promise.reject('Reset doesn\'t exist.');
    }

    if (moment(row.expires).isBefore(moment()) || row.used) {
      return Promise.reject('Reset has expired.');
    }

    await createValidator({
      resource: 'users',
      mode: 'forgot-my-password',
    })
    .validate({
      password: newPassword,
    });

    await changePassword(row.UserId, newPassword);

    await models.UserReset.update({ used: true }, {
      where: {
        id: row.id,
      },
    });

    return undefined;
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
