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
						token: '938C506D-F838-F447-8B43-4EBF34706E0445B2B503-977D-452F-A97B-A65BB32D6F15',
						accountName: 'cool.4321',
						accountId: 'haha_id',
						permissions: 'cool,permissions',
						world: 1234,
						UserId: user.id
					});
			})
			.then(function (token) {
				return models
					.Gw2Character
					.create({
						name: 'character',
						race: 'race',
						gender: 'gender',
						profession: 'profession',
						level: 69,
						created: '01/01/90',
						age: 20,
						deaths: 2,
						Gw2ApiTokenToken: token.token
					});
			});
	}
};