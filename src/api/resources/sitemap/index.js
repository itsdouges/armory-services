// @flow

import type { Server } from 'restify';

import _ from 'lodash';

export default function SitemapResource (server: Server, controller: any) {
  server.get('/sitemap.xml', async (req, res, next) => {
    res.setHeader('Content-Type', 'text/xml');

    try {
      const sitemapIndex = await controller.index();
      res.send(200, sitemapIndex);
    } catch (error) {
      console.error(error);
      res.send(500);
    }

    return next();
  });

  server.get(/^\/sitemap-([a-z]+)-(\d+)\.xml/, async (req, res, next) => {
    res.setHeader('Content-Type', 'text/xml');

    const [resource, page] = req.params;

    try {
      const sitemapIndex = await controller.generate(resource, _.toInteger(page));
      res.send(200, sitemapIndex);
    } catch (error) {
      console.error(error);
      res.send(500);
    }

    return next();
  });
}
