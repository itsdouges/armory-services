var AWS = require('aws-sdk');

var S3_BUCKET = process.env.IMAGE_BUCKET || 'images.gw2armory.com';
var EXPIRY_TIMEOUT = 60;

if (process.env.ENV === 'PROD' && !process.env.IMAGE_UPLOAD_ACCESS_KEY_ID) {
  throw 'Environment variable "IMAGE_UPLOAD_ACCESS_KEY_ID" is not defined!';
}

if (process.env.ENV === 'PROD' && !process.env.IMAGE_UPLOAD_SECRET_ACCESS_KEY) {
  throw 'Environment variable "IMAGE_UPLOAD_SECRET_ACCESS_KEY" is not defined!';
}

AWS.config.update({
  accessKeyId: process.env.IMAGE_UPLOAD_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.IMAGE_UPLOAD_SECRET_ACCESS_KEY || '',
  s3Bucket: S3_BUCKET,
});

function getSignedUrl (options) {
  return new Promise (function (resolve, reject) {
    var s3 = new AWS.S3();
    var key = options.alias + '/' + options.fileName;

    var params = {
      Bucket: S3_BUCKET,
      Key: key,
      Expires: EXPIRY_TIMEOUT,
      ContentType: options.contentType,
    };

    s3.getSignedUrl('putObject', params, function (err, data) {
      if (err)
        reject(err);
      else {
        var signedData = {
          url: 'https://images.gw2armory.com/' + key,
          signedRequest: data,
        };

        resolve(signedData);
      }
    });
  });
}

module.exports = {
  getSignedUrl: getSignedUrl,
};
