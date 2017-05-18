// @flow

import type { Server } from 'restify';

import _ from 'lodash';

const sendXml = (res, data) => {
  res.writeHead(200, {
    'Content-Type': 'application/xml',
  });
  res.write(data);
  res.end();
};

export default function SitemapResource (server: Server, controller: any) {
  server.get('/sitemap.xml', async (req, res, next) => {
    try {
      const index = await controller.index();
      sendXml(res, index, next);
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
      const sitemap = await controller.generate(resource, _.toInteger(page));
      sendXml(res, sitemap, next);
    } catch (error) {
      console.error(error);
      res.send(500);
    }

    return next();
  });
}
