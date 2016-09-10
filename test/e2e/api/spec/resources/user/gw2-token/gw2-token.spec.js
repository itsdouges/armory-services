frisby.create('POST gw2-token with no jwt')
    .post(API_ENDPOINT + 'users/me/gw2-tokens')
    .expectStatus(401)
    .toss();

frisby.create('DELETE gw2-token with taken token valid jwt')
    .delete(API_ENDPOINT + 'users/me/gw2-tokens/im-a-token')
    .expectStatus(401)
    .toss();

var email = getRandomEmail();

/**
 * As a user
 * I want to register an account
 * So I can access gw2armory
 */
frisby.create('POST user with good body')
    .post(API_ENDPOINT + 'users', {
        email: email,
        alias: getRandomString(),
        password: strongPass
    })
    .expectStatus(200)
    .after(function () {
        /**
         * As a user
         * I want to get a jwt
         * So I can access secured endpoints
         */
        frisby.create('POST get a token to use')
            .post(API_ENDPOINT + 'token', {
                grant_type: 'password',
                username: email,
                password: strongPass
            }, { json: true })
            .addHeader('Authorization', 'Basic Z3cyQXJtb3J5V2ViOlNXQGcwci0=')
            .expectStatus(200)
            .afterJSON(function (response) {
                expect(response.expires_in).toBeDefined();
                expect(response.token_type).toBe('Bearer');
                expect(response.access_token).toBeDefined();

                var token = response.token_type + ' ' + response.access_token;
                var gw2token = '0C87E308-4B55-1E46-B381-9F29AE49E2128FCA9D47-A3A9-496E-AED0-D531E3BDB25C';
                
                /**
                 * As a user
                 * I want to add a token to my accout
                 * So I can access my characters
                 */
                frisby.create('POST gw2 api token')
                    .addHeader('Authorization', token)
                    .post(API_ENDPOINT + 'users/me/gw2-tokens', {
                        token: gw2token
                    })
                    .expectStatus(200)
                    .after(function () {
                        /**
                         * As a user
                         * I want to add the same token to my accout
                         * And be told that I'm not allowed to
                         */
                        // TODO: This is failing. Figure out why.
                        frisby.create('POST another gw2 api token that is already taken')
                            .addHeader('Authorization', token)
                            .post(API_ENDPOINT + 'users/me/gw2-tokens', {
                                token: gw2token
                            })
                            .expectStatus(400)
                            .after(function () {
                                /**
                                 * As a user
                                 * I want to remove the token I added
                                 * So that my characters are removed from the armory
                                 */
                                frisby.create('DELETE gw2 api token')
                                    .addHeader('Authorization', token)
                                    .delete(API_ENDPOINT + 'users/me/gw2-tokens/' + gw2token)
                                    .expectStatus(200)
                                    .after(function () {
                                        /**
                                         * As a user
                                         * I want to check that my token is now free
                                         * So that I can feel safe
                                         */
                                        // TODO: Need to use new tokens because ive implemented the account already exists check!
                                        frisby.create('GET check gw2-token with bad token')
                                            .get(API_ENDPOINT + 'users/check/gw2-token/'  + gw2token)
                                            .expectStatus(200)
                                            .toss();
                                    })
                                    .toss();
                            })
                            .toss();
                    })
                    .toss();
            })
            .toss();
    })
    .toss();