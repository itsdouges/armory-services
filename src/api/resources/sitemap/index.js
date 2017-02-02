// @flow

import type { Server } from 'restify';

import _ from 'lodash';

export default function SitemapResource (server: Server, controller: any) {
  server.get('/sitemap.xml', async (req, res, next) => {
    res.setHeader('content-type', 'text/xml; charset=utf-8');

    try {
      const sitemapIndex = await controller.index();
      res.send(200, sitemapIndex);
    } catch (error) {
      console.error(error);
      res.send(500);
    }

    return next();
  });

  server.get(/^\/sitemap(\d+)\.xml/, async (req, res, next) => {
    res.setHeader('content-type', 'text/xml; charset=utf-8');

    const page = _.toInteger(req.params[0]);

    try {
      const sitemapIndex = await controller.generate(page);
      res.send(200, sitemapIndex);
    } catch (error) {
      console.error(error);
      res.send(500);
    }

    return next();
  });
}
