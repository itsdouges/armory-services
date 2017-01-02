'use strict';

var RESOURCE = Object.freeze({
    main: '/users/me/gw2-tokens',
    item: '/users/me/gw2-tokens/:token'
});

function Gw2TokenResource(server, controller) {
    server.get(RESOURCE.main, function (req, res, next) {
    if (!req.username) {
        return res.sendUnauthenticated();
    }
        
        controller
            .list(req.username)
            .then(function (tokens) {
                res.send(200, tokens);
                return next();
            }, function (err) {
                res.send(500, err);
                return next();
            });
    });

    server.post(RESOURCE.main, function (req, res, next) {
    if (!req.username) {
        return res.sendUnauthenticated();
    }
        
        controller
            .add(req.username, req.params.token)
            .then(function (data) {
                res.send(200, data);
                return next();
            }, function (e) {
                res.send(400, e);
                return next();
            });
    });

    server.del(RESOURCE.item, function (req, res, next) {
    if (!req.username) {
        return res.sendUnauthenticated();
    }
        
        controller
            .remove(req.username, req.params.token)
            .then(function () {
                res.send(200);
                return next();
            }, function (err) {
                res.send(500, err);
                return next();
            });
    });

    server.put(RESOURCE.item + '/set-primary', function (req, res, next) {
    if (!req.username) {
        return res.sendUnauthenticated();
    }

        controller
            .selectPrimary(req.username, req.params.token)
            .then(function () {
                res.send(200);
                return next();
            }, function (err) {
                res.send(500, err);
                return next();
            });
    });
}

module.exports = Gw2TokenResource;