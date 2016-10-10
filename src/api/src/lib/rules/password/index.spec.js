var password = require('./index');

describe('required rule', function () {
    it ('should return undefined if password is ok', function () {
        var result = password('password', 'PassworD!');

        expect(result).to.not.exist();
    });

    it ('should return error if password is not strong enough', function () {
        var result = password('password', 'nah');

        expect(result).to.equal('must be greater than or equal to 8 characters long, contain one or more uppercase and lowercase character');
    });
});
