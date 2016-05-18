var Sequelize = require('sequelize');

module.exports = {
    TestDb: function () {
    return new Sequelize('database', 'username', 'password', {                                                                                                                                                             
        dialect: 'sqlite',
        logging: false
    });
    },
    seedData:   function (models) {
        var userId;
            
        return models
            .User
            .create({
                email: 'cool@email.com',
                passwordHash: 'realhashseriously',
                alias: 'huedwell'
            })
            .then(function (user) {
                userId = user.id;

                return models
                    .Gw2ApiToken
                    .create({
                        token: '938C506D-F838-F447-8B43-4EBF34706E0445B2B503-977D-452F-A97B-A65BB32D6F15',
                        accountName: 'cool.4321',
                        accountId: 'haha_id',
                        permissions: 'cool,permissions',
                        world: 1234,
                        UserId: userId
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
            })
            .then(function () {
                return models
                    .Gw2ApiToken
                    .create({
                        token: '25E6FAC3-1912-7E47-9420-2965C5E4D63DEAA54B0F-092E-48A8-A2AE-9E197DF4BC8B',
                        accountName: 'cool.4322',
                        accountId: 'haha_iddd',
                        permissions: 'cool,permissions',
                        world: 1234,
                        UserId: userId
                    });
            });
    }
};