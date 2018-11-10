// @flow

import type { Models, User } from 'flowTypes';

import moment from 'moment';
import _ from 'lodash';
import createValidator from 'gotta-validate';

import { notFound, unauthorized } from 'lib/errors';
import gw2 from 'lib/gw2';
import { tryFetch } from 'lib/services/fetch';
import emailClient from 'lib/email';
import { read as readToken } from 'lib/services/tokens';
import { forgotMyPassword as forgotMyPasswordTemplate } from 'lib/email/templates';
import { hashPassword, verifyHash } from 'lib/password';
import { read as readGuild } from 'lib/services/guild';
import {
  read as readUser,
  create as createUser,
  update as updateUser,
  createPasswordReset,
  readPasswordReset,
  finishPasswordReset,
  claimStubUser,
  setPrivacy as setPrivacyUser,
  removePrivacy as removePrivacyUser,
} from 'lib/services/user';

export default function userControllerFactory(models: Models) {
  createValidator
    .addResource({
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
      mode: 'claim',
      rules: {
        alias: ['required', 'unique-alias', 'no-white-space', 'min5'],
        email: ['required', 'unique-email', 'no-white-space'],
        password: ['required', 'ezpassword', 'no-white-space'],
        apiToken: ['required', 'valid-gw2-token', 'no-white-space'],
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

  type CreateUser = User & {
    password: string,
  };

  async function create(user: CreateUser) {
    const validator = createValidator({
      resource: 'users',
      mode: 'create',
    });

    await validator.validate(user);
    const passwordHash = await hashPassword(user.password);

    return await createUser(models, {
      ...user,
      passwordHash,
    });
  }

  type ReadPublicOptions = {
    alias?: string,
    email?: string,
    excludeChildren?: boolean,
  };

  const cleanUser = user => _.omit(user, ['id', 'passwordHash', 'token', 'email']);

  async function read({ email, alias, excludeChildren }: ReadPublicOptions = {}) {
    const user = await readUser(models, { alias, email });
    if (!user) {
      throw new Error('No user was found.');
    }

    user.tokenId && tryFetch(models, user.tokenId);

    if (excludeChildren) {
      return cleanUser(user);
    }

    let guilds = [];
    if (user.guilds) {
      const promises = user.guilds.split(',').map(id => readGuild(models, { id }));

      guilds = await Promise.all(promises);
      guilds = guilds.filter(guild => !!guild).map(guild => _.pick(guild, ['id', 'tag', 'name']));
    }

    return {
      ...cleanUser(user),
      guilds,
    };
  }

  async function changePassword(id, newPassword) {
    const passwordHash = await hashPassword(newPassword);
    await updateUser(models, {
      id,
      passwordHash,
    });
  }

  type UpdatePasswordOptions = {
    email: string,
    password: string,
    currentPassword: string,
  };

  async function updatePassword(user: UpdatePasswordOptions) {
    const validator = createValidator({
      resource: 'users',
      mode: 'update-password',
    });

    await validator.validate(user);

    const usr = await readUser(models, { email: user.email });
    if (!usr) {
      throw new Error('User not found');
    }

    await verifyHash(usr.passwordHash, user.currentPassword);
    await changePassword(usr.id, user.password);
  }

  async function forgotMyPasswordStart(email: string) {
    const user = await readUser(models, { email });
    if (!user) {
      throw new Error('User not found');
    }

    const id = await createPasswordReset(models, user.id);

    await emailClient.send({
      subject: 'Forgot My Password',
      to: email,
      html: forgotMyPasswordTemplate(id),
    });
  }

  async function forgotMyPasswordFinish(guid: string, newPassword: string) {
    const row = await readPasswordReset(models, guid);
    if (!row) {
      throw new Error("Reset doesn't exist.");
    }

    if (moment(row.expires).isBefore(moment()) || row.used) {
      throw new Error('Reset has expired.');
    }

    await createValidator({
      resource: 'users',
      mode: 'forgot-my-password',
    }).validate({
      password: newPassword,
    });

    await changePassword(row.UserId, newPassword);

    await finishPasswordReset(models, guid);
  }

  type ClaimUser = CreateUser & {
    apiToken: string,
  };

  async function claim(user: ClaimUser) {
    const validator = createValidator({
      resource: 'users',
      mode: 'claim',
    });

    await validator.validate(user);

    const passwordHash = await hashPassword(user.password);

    await claimStubUser(models, {
      ...user,
      passwordHash,
    });
  }

  async function readUserWithAccess(alias, accessType, { email } = {}) {
    const user = await readUser(models, { alias, mode: 'lean' });
    if (!user) {
      throw notFound();
    }

    if (user.email === email) {
      return user;
    }

    if (user.privacy && user.privacy.includes(accessType)) {
      throw unauthorized();
    }

    return user;
  }

  async function setPrivacy(email: string, privacy: string) {
    return setPrivacyUser(models, email, privacy);
  }

  async function removePrivacy(email: string, privacy: string) {
    return removePrivacyUser(models, email, privacy);
  }

  const userMethodMap = {
    achievements: gw2.readAchievements,
    bank: gw2.readBank,
    inventory: gw2.readInventory,
    materials: gw2.readMaterials,
    wallet: gw2.readWallet,
    dungeons: gw2.readDungeons,
    dyes: gw2.readDyes,
    finishers: gw2.readFinishers,
    masteries: gw2.readMasteries,
    masteryPoints: gw2.readMasteryPoints,
    mail: gw2.readMail,
    gliders: gw2.readGliders,
    mailCarriers: gw2.readMailCarriers,
    homeCats: gw2.readCats,
    homeNodes: gw2.readNodes,
    pvpHeroes: gw2.readPvpHeroes,
    minis: gw2.readMinis,
    outfits: gw2.readOutfits,
    raids: gw2.readRaids,
    recipes: gw2.readRecipes,
    skins: gw2.readSkins,
    titles: gw2.readTitles,
    pvpStats: gw2.readPvpStats,
    pvpGames: gw2.readPvpGames,
    pvpStandings: gw2.readPvpStandings,
  };

  const userMethods = _.reduce(
    userMethodMap,
    (obj, func, methodName) => {
      return {
        ...obj,
        [methodName]: async (alias, { email } = {}) => {
          const user = await readUserWithAccess(alias, methodName, { email });
          if (!user || !user.tokenId) {
            throw notFound();
          }

          const { token } = await readToken(models, { id: user.tokenId });
          return func(token);
        },
      };
    },
    {}
  );

  return {
    ...userMethods,
    setPrivacy,
    removePrivacy,
    create,
    read,
    updatePassword,
    forgotMyPasswordStart,
    forgotMyPasswordFinish,
    claim,
  };
}
