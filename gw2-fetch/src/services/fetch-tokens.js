'use strict';

function readTokens (models) {
	return models.Gw2ApiToken
		.findAll()
		.then(function (items) {
			return items.map(function (item) {
				return {
					token: item.dataValues.token,
					UserId: item.dataValues.UserId
				};
			});
		});
}

module.exports = readTokens;