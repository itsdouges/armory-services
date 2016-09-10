var q = require('q');

function guildController (models) {
    function read (name) {
        return models.Gw2Guild.findOne({
            where: {
                name: name
            }
        })
        .then(function (guild) {
            if (!guild) {
                return undefined;
            }

            return {
                name: guild.name,
                id: guild.id,
                tag: guild.tag
            };
        })
        .then(function (guild) {
            return models.Gw2Character.findAll({
                    where: {
                        guild: guild.id
                    },
                    include: [{
                        model: models.Gw2ApiToken,
                        include: [{
                            model: models.User
                        }]
                    }]
                })
                .then(function (characters) {
                    var mappedCharacters = characters.map(function (c) {
                        return {
                            world: 'world',
                            name: c.name,
                            gender: c.gender,
                            profession: c.profession,
                            level: c.level,
                            race: c.race,
                            userAlias: c.Gw2ApiToken.User.alias,
                            accountName: c.Gw2ApiToken.accountName
                        };
                    });

                    guild.characters = mappedCharacters;
                    return guild;
                });
        });
    }

    return {
        read: read
    };
}

module.exports = guildController;