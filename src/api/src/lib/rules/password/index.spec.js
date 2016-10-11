const password = require('./index');

describe('required rule', () => {
  it('should return undefined if password is ok', () => {
    const result = password('password', 'PassworD!');

    expect(result).to.not.exist;
  });

  it('should return error if password is not strong enough', () => {
    const result = password('password', 'nah');

    // eslint-disable-next-line
    expect(result).to.equal('must be greater than or equal to 8 characters long, contain one or more uppercase and lowercase character');
  });
});
