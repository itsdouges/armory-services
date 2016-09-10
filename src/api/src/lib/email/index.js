const nodemailer = require('nodemailer');
const ses = require('nodemailer-ses-transport');
const config = require('../../../env');

let transporter;

module.exports = {
  send (options) {
    return new Promise((resolve, reject) => {
      if (!transporter) {
        transporter = nodemailer.createTransport(ses({
          transport: 'ses',
          accessKeyId: config.email.smtp.user,
          secretAccessKey: config.email.smtp.password,
          region: 'us-east-1',
        }));
      }

      const mergedConfig = Object.assign({}, options, {
        subject: `${options.subject} | Guild Wars 2 Armory`,
        from: config.email.noreply,
      });

      return transporter.sendMail(mergedConfig, (error, info) => {
        if (error) {
          return reject(error);
        }

        return resolve(info);
      });
    });
  },
};
