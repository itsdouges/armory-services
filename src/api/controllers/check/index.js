var q = require('q');

var validGw2Token = require('lib/rules/valid-gw2-token');

function CheckController(Validator) {
    Validator.addResource({
            name: 'check',
            mode: 'gw2-token',
            rules: {
                token: ['valid-gw2-token', 'required', 'no-white-space']
            }
        }).addResource({
            name: 'check',
            mode: 'email',
            rules: {
                email: ['unique-email', 'required', 'no-white-space']
            }
        }).addResource({
            name: 'check',
            mode: 'alias',
            rules: {
                alias: ['unique-alias', 'required', 'no-white-space', 'min5']
            }
        });

    CheckController.prototype.gw2Token = function (token) {
        var validator = Validator({
            resource: 'check',
            mode: 'gw2-token'
        });

        return validator.validate(token);
    };

    CheckController.prototype.email = function (email) {
        var validator = Validator({
            resource: 'check',
            mode: 'email'
        });

        return validator.validate(email);
    };

    CheckController.prototype.alias = function (alias) {
        var validator = Validator({
            resource: 'check',
            mode: 'alias'
        });

        return validator.validate(alias);
    };
}

module.exports = CheckController;
