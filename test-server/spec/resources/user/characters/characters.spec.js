'use strict';

/**
 * As a user
 * I want to look at a character
 */

frisby.create('GET my characters')
    .get(API_ENDPOINT + 'users/me/characters')
    .expectStatus(401)
    .toss();