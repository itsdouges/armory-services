Copyright (c) 2015 Michael Dougall

#TODO iteration 1:

## gw2-fetch
- token invalidation
- character name change/deletion
- error handling (401/402/500)
- unit tests
- int tests

## token validator
- check that account id doesnt alraedy exist in database

## characters resource
- list characters for alias
- list characters for accountName

## hardening
- error handling for 500s
- error logging

## deployment
- setup env variables
- deployment scripts for aws
- deploy to aws!