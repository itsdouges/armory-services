var uniqueEmail = require('./index');
var Models = require('lib/models');

describe('unique email rule', function () {
    var models;

    beforeEach(async function () {
      models = await setupTestDb();
    });

    it('should resolve if email is not found', function (done) {
        uniqueEmail('email', 'cool@email.com', {
            models: models
        })
        .then(function () {
            done();
        });
    });

    it('should resolve if email is unique', function (done) {
        uniqueEmail('email', 'cool@email.com!!', {
            models: models
        })
        .then(function () {
            done();
        });
    });

    it('should resolve with error if email is not unique', function (done) {
        models.User
        .create({
                email: 'cool@email.com',
                passwordHash: 'lolz',
                alias: 'swagn'
            })
        .then(function () {
            uniqueEmail('email', 'cool@email.com', {
                models: models
            })
            .then(function (e) {
                expect(e.property).to.equal('email');
                expect(e.message).to.equal('is taken');
                done();
            });
        });
    });
});
