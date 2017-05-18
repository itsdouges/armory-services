// @flow

import type { Server } from 'restify';

import _ from 'lodash';

export default function SitemapResource (server: Server, controller: any) {
  server.get('/sitemap.xml', async (req, res, next) => {
    try {
      const sitemapIndex = await controller.index();
      res.setHeader('Content-Type', 'application/xml');
      res.send(200, sitemapIndex);
    } catch (error) {
      console.error(error);
      res.send(500);
    }

    return next();
  });

  server.get(/^\/sitemap-([a-z]+)-(\d+)\.xml/, async (req, res, next) => {
    try {
      // eslint-disable-next-line quote-props
      const { '0': resource, '1': page } = req.params;
      const sitemapIndex = await controller.generate(resource, _.toInteger(page));
      res.setHeader('Content-Type', 'application/xml');
      res.send(200, sitemapIndex);
    } catch (error) {
      console.error(error);
      res.send(500);
    }

    return next();
  });
}
