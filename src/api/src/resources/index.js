module.exports = function IndexResource (server) {
  server.get('/', (req, res, next) => {
    res.send(200);
    return next();
  });
};
