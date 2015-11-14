'use strict';

function readTokens (models) {
	return models.Gw2ApiToken
		.findAll({
			where: {
				valid: true
			}
		})
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