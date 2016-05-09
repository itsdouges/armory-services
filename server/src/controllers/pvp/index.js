var userHelper = require('../../helpers/get-user-info');

function PvpController (models, gw2Api) {
  PvpController.prototype.stats = function (alias) {
    return userHelper.getUserPrimaryToken(models, alias)
      .then(function (token) {
        return gw2Api.readPvpStats(token);
      });
  };

  PvpController.prototype.games = function (alias) {
    return userHelper.getUserPrimaryToken(models, alias)
      .then(function (token) {
        return gw2Api.readPvpGames(token);
      });
  };
}

module.exports = PvpController;
