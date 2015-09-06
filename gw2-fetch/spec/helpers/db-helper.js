var Sequelize = require('sequelize');

module.exports = {
	TestDb: function () {
    return new Sequelize('database', 'username', 'password', {                                                                                                                                                             
        dialect: 'sqlite',
        logging: false
    });
	},
	seedData:	function (models) {
		return models
			.User
			.create({
				email: 'cool@email.com',
				passwordHash: 'realhashseriously',
				alias: 'huedwell'
			})
			.then(function () {
				return models
					.User
					.findOne({
						where: {
							email: 'cool@email.com'
						}
					});
			})
			.then(function (user) {
				return models
					.Gw2ApiToken
					.create({
						token: '0C87E308-4B55-1E46-B381-9F29AE49E2128FCA9D47-A3A9-496E-AED0-D531E3BDB25C',
						accountName: 'cool.4321',
						accountId: 'haha_id',
						world: 1234,
						UserId: user.id
					})
					.then(function () {
						return models
							.Gw2ApiToken
							.create({
								token: 'another5real',
								accountName: 'cool.1234',
								accountId: 'realiddoe',
								world: 1234,
								UserId: user.id,
								valid: false
							});
					})
					.then(function () {
						return models
							.Gw2ApiToken
							.create({
								token: '25E6FAC3-1912-7E47-9420-2965C5E4D63DEAA54B0F-092E-48A8-A2AE-9E197DF4BC8B',
								accountName: 'cool.aaaa',
								accountId: 'heheid',
								world: 1234,
								UserId: user.id
							});
					})
					.then(function () {
						return models
							.Gw2ApiToken
							.create({
								token: '70EC1A3F-5EF3-3C46-B367-79248F7C8DD241FB192B-DA7E-499D-8A54-8675470F1F71',
								accountName: 'cool.aaaa',
								world: 1234,
								accountId: 'hheid',
								UserId: user.id
							});
					});
			});
	}
};