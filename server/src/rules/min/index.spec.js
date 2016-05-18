var rule = require('./index');

describe('min length rule', function () {
    it('should return error if less than 5', function () {
        var error = rule.five(null, '1234');

        expect(error).toBe('needs to be at least 5 characters long!');
    });

    it('should return undefined if greater or equal to 5', function () {
        var error = rule.five(null, '12355');

        expect(error).toBe(undefined);
    });
});