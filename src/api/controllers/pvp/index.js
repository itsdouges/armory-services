import * as userHelper from 'lib/services/user';

function handleBadToken (defaultValue, error) {
  if (error === 'Token not found' || (error.data && error.data.text === 'requires scope pvp')) {
    return defaultValue;
  }

  throw error;
}

function PvpController (models, gw2Api) {
  PvpController.prototype.stats = function (alias) {
    return userHelper.getUserPrimaryToken(models, alias)
      .then((token) => {
        return gw2Api.readPvpStats(token);
      })
      .catch(handleBadToken.bind(null, {}));
  };

  PvpController.prototype.games = function (alias) {
    return userHelper.getUserPrimaryToken(models, alias)
      .then((token) => {
        return gw2Api.readPvpGames(token);
      })
      .catch(handleBadToken.bind(null, []));
  };

  PvpController.prototype.standings = function (alias) {
    return userHelper.getUserPrimaryToken(models, alias)
      .then((token) => {
        return gw2Api.readPvpStandings(token);
      })
      .catch(handleBadToken.bind(null, []));
  };

  PvpController.prototype.achievements = function (alias) {
    return userHelper.getUserPrimaryToken(models, alias)
      .then((token) => {
        return gw2Api.readAchievements(token);
      })
      .catch(handleBadToken.bind(null, []));
  };
}

module.exports = PvpController;
