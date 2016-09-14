module.exports = function SitemapResource (server, controller) {
  server.get('/sitemap.xml', (req, res, next) => {
    res.setHeader('content-type', 'application/xml');

    controller
      .generate()
      .then((sitemap) => res.send(200, sitemap), (e) => console.error(e) || res.send(500));

    return next();
  });
};
