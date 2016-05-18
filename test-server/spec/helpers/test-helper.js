/**
 * Global variables used in all tests.
 */
module.exports = {
    frisby: require('frisby'),
    API_ENDPOINT: 'http://192.168.59.103:8082/',
    getRandomString: function () {
    var random = Math.floor(Math.random() * 100001);
    var timestamp = (new Date()).getTime();
    return '' + random + timestamp;
    },
    getRandomEmail: function () {
        return this.getRandomString() + '@' + this.getRandomString() + '.com';
    },
    strongPass: '1mReallyStrongM@n!'
};
