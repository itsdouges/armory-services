import checkResourceFactory from './';

describe('check resource', () => {
  let systemUnderTest;

  let mocks;

  let mockValidator;

  beforeEach(() => {
    mocks = {
      validate () {},
    };

    mockValidator = function () {
      return {
        validate: mocks.validate,
      };
    };

    mockValidator.addResource = function () { };

    sinon.stub(mockValidator, 'addResource').returns(mockValidator);
  });

  describe('initialisation', () => {
    it('should add gw2 token resource to validator', () => {
      systemUnderTest = checkResourceFactory(mockValidator);

      expect(mockValidator.addResource).to.have.been.calledWith({
        name: 'check',
        mode: 'gw2-token',
        rules: {
          token: ['valid-gw2-token', 'required', 'no-white-space'],
        },
      });
    });

    it('should add email resource to validator', () => {
      systemUnderTest = checkResourceFactory(mockValidator);

      expect(mockValidator.addResource).to.have.been.calledWith({
        name: 'check',
        mode: 'email',
        rules: {
          email: ['unique-email', 'required', 'no-white-space'],
        },
      });
    });

    it('should add alias resource to validator', () => {
      systemUnderTest = checkResourceFactory(mockValidator);

      expect(mockValidator.addResource).to.have.been.calledWith({
        name: 'check',
        mode: 'alias',
        rules: {
          alias: ['unique-alias', 'required', 'no-white-space', 'min5'],
        },
      });
    });
  });

  describe('gw2-token', () => {
    it('should resolve', (done) => {
      systemUnderTest = checkResourceFactory(mockValidator);

      sinon.stub(mocks, 'validate').returns(Promise.resolve());

      systemUnderTest.gw2Token('token')
        .then(() => {
          expect(mocks.validate).to.have.been.calledWith('token');

          done();
        });
    });

    it('should reject', (done) => {
      systemUnderTest = checkResourceFactory(mockValidator);

      sinon.stub(mocks, 'validate').returns(Promise.reject());

      systemUnderTest.gw2Token('token')
        .then(null, () => {
          expect(mocks.validate).to.have.been.calledWith('token');

          done();
        });
    });
  });

  describe('email', () => {
    it('should resolve', (done) => {
      systemUnderTest = checkResourceFactory(mockValidator);

      sinon.stub(mocks, 'validate').returns(Promise.resolve());

      systemUnderTest.email('email')
        .then(() => {
          expect(mocks.validate).to.have.been.calledWith('email');

          done();
        });
    });

    it('should reject', (done) => {
      systemUnderTest = checkResourceFactory(mockValidator);

      sinon.stub(mocks, 'validate').returns(Promise.reject('ahh!!!'));

      systemUnderTest.email('email')
        .then(null, (e) => {
          expect(e).to.equal('ahh!!!');

          done();
        });
    });
  });

  describe('alias', () => {
    it('should resolve', (done) => {
      systemUnderTest = checkResourceFactory(mockValidator);

      sinon.stub(mocks, 'validate').returns(Promise.resolve());

      systemUnderTest.alias('a')
        .then(() => {
          expect(mocks.validate).to.have.been.calledWith('a');

          done();
        });
    });

    it('should reject', (done) => {
      systemUnderTest = checkResourceFactory(mockValidator);

      sinon.stub(mocks, 'validate').returns(Promise.reject('ahh!!!'));

      systemUnderTest.alias('b')
        .then(null, (e) => {
          expect(e).to.equal('ahh!!!');

          done();
        });
    });
  });
});
