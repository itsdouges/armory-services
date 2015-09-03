Copyright (c) 2015 Michael Dougall

#TODO iteration 1:

## gw2-fetch
- handle token invalidation
- handle character name change/deletion edge case
- error handling (401/402/500)
- update unit tests
- implement int tests
- create endpoint to immediately fetch user details and store to db

## token validator
- check that account id doesnt alraedy exist in database [done]

## characters resource
- list characters for email [done]

## hardening
- error handling for 500s
- error logging

## deployment
- setup env variables
- deployment scripts for aws
- deploy to aws!