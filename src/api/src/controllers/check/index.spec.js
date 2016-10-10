var CheckResource = require('./index');
var Models = require('../../models');
var q = require('q');

describe('check resource', function () {
    var systemUnderTest;
    var models;

    var mocks = {
        validate: function () {}
    };

    var mockValidator;

    beforeEach(function () {
        mockValidator = function () {
            return {
                validate: mocks.validate
            };
        };

        mockValidator.addResource = function () { };

        sinon.stub(mockValidator, 'addResource').returns(mockValidator);
    });

    describe('initialisation', function () {
        it('should add gw2 token resource to validator', function () {
            systemUnderTest = new CheckResource(mockValidator);

            expect(mockValidator.addResource).to.have.been.calledWith({
                name: 'check',
                mode: 'gw2-token',
                rules: {
                    token: ['valid-gw2-token', 'required', 'no-white-space']
                }
            });
        });

        it('should add email resource to validator', function () {
            systemUnderTest = new CheckResource(mockValidator);

            expect(mockValidator.addResource).to.have.been.calledWith({
                name: 'check',
                mode: 'email',
                rules: {
                    email: ['unique-email', 'required', 'no-white-space']
                }
            });
        });

        it('should add alias resource to validator', function () {
            systemUnderTest = new CheckResource(mockValidator);

            expect(mockValidator.addResource).to.have.been.calledWith({
                name: 'check',
                mode: 'alias',
                rules: {
                    alias: ['unique-alias', 'required', 'no-white-space', 'min5']
                }
            });
        });
    });

    describe('gw2-token', function () {
        it('should resolve', function (done) {
            systemUnderTest = new CheckResource(mockValidator);

            var defer = q.defer();

            sinon.stub(mocks, 'validate').returns(defer.promise);

            systemUnderTest.gw2Token('token')
                .then(function () {
                    expect(mocks.validate).to.have.been.calledWith('token');

                    done();
                });

            defer.resolve();
        });

        it('should reject', function (done) {
            systemUnderTest = new CheckResource(mockValidator);

            var defer = q.defer();

            sinon.stub(mocks, 'validate').returns(defer.promise);

            systemUnderTest.gw2Token('token')
                .then(null, function () {
                    expect(mocks.validate).to.have.been.calledWith('token');

                    done();
                });

            defer.reject();
        });
    });

    describe('email', function () {
        it('should resolve', function (done) {
            systemUnderTest = new CheckResource(mockValidator);

            var defer = q.defer();

            sinon.stub(mocks, 'validate').returns(defer.promise);

            systemUnderTest.email('email')
                .then(function () {
                    expect(mocks.validate).to.have.been.calledWith('email');

                    done();
                });

            defer.resolve();
        });

        it('should reject', function (done) {
            systemUnderTest = new CheckResource(mockValidator);

            var defer = q.defer();

            sinon.stub(mocks, 'validate').returns(defer.promise);

            systemUnderTest.email('email')
                .then(null, function (e) {
                    expect(e).to.equal('ahh!!!');

                    done();
                });

            defer.reject('ahh!!!');
        });
    });

    describe('alias', function () {
        it('should resolve', function (done) {
            systemUnderTest = new CheckResource(mockValidator);

            var defer = q.defer();

            sinon.stub(mocks, 'validate').returns(defer.promise);

            systemUnderTest.alias('a')
                .then(function () {
                    expect(mocks.validate).to.have.been.calledWith('a');

                    done();
                });

            defer.resolve();
        });

        it('should reject', function (done) {
            systemUnderTest = new CheckResource(mockValidator);

            var defer = q.defer();

            sinon.stub(mocks, 'validate').returns(defer.promise);

            systemUnderTest.alias('b')
                .then(null, function (e) {
                    expect(e).to.equal('ahh!!!');

                    done();
                });

            defer.reject('ahh!!!');
        });
    });
});
