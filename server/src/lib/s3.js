var AWS = require('aws-sdk');

var S3_BUCKET = 'gw2armory-image-uploads';
var EXPIRY_TIME = 1200;

AWS.config.update({
  accessKeyId: 'AKIAJW4ZF6YKXANEAK6A',
  secretAccessKey: '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',
  s3Bucket: S3_BUCKET,
});

function getSignedUrl (options) {
  return new Promise (function (resolve, reject) {
    var s3 = new AWS.S3();
    var key = options.alias + '/' + options.fileName;

    var params = {
      Bucket: S3_BUCKET,
      Key: key,
      Expires: EXPIRY_TIME,
      ContentType: options.contentType,
      ACL: 'public-read',
    };

    s3.getSignedUrl('putObject', params, function (err, data) {
      if (err)
        reject(err);
      else {
        var signedData = {
          url: 'https://' + S3_BUCKET + '.s3.amazonaws.com/' + key,
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
