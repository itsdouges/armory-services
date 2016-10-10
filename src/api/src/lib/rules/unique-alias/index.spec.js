var uniqueAlias = require('./index');
var Models = require('../../../models');

describe('unique email rule', function () {
    var models;

    beforeEach(function (done) {
        models = new Models(testDb());
        models.sequelize.sync().then(function () {
            done();
        });
    });

    it('should resolve if alias is not found', function (done) {
        uniqueAlias('alias', 'madou', {
            models: models
        })
        .then(function () {
            done();
        });
    });

    it('should resolve if alias is unique', function (done) {
        uniqueAlias('alias', 'madou', {
            models: models
        })
        .then(function () {
            done();
        });
    });

    it('should resolve with error if alias is not unique', function (done) {
        models.User
        .create({
            alias: 'madou',
            email: 'emaiL@email',
            passwordHash: 'coolhash'
        })
        .then(function () {
            uniqueAlias('alias', 'madou', {
                models: models
            })
            .then(function (e) {
                expect(e.property).to.equal('alias');
                expect(e.message).to.equal('is taken');
                done();
            });
        });
    });
});
