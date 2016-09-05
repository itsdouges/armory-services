'use strict';

/**
 * As a user
 * I want to check that my alias is free
 * So I can use it to create an account
 */

frisby.create('GET check alias with good alias')
    .get(API_ENDPOINT + 'users/check/alias/madoooo')
    .expectStatus(200)
    .toss();

frisby.create('GET check alias with bad alias')
    .get(API_ENDPOINT + 'users/check/alias/bade mail')
    .expectStatus(400)
    .toss();