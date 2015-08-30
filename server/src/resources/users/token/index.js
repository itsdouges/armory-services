restifyOAuth2.ropc(server, { 
    tokenEndpoint: RESOURCES.TOKEN, 
    hooks: hooks,
    tokenExpirationTime: 60
});

server.get(RESOURCES.TOKEN, function (req, res) {
    if (!req.username) {
        return res.sendUnauthenticated();
    }

    res.contentType = "application/json";
    res.send();
});