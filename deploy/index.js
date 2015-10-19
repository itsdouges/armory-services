var mustache = require('mustache');
var fs = require('fs');

var ENVIRONMENT = process.env['ENV'];
if (!ENVIRONMENT) {
	throw 'Environment variable "ENV" is not defined.';
}

var data = {
	ENV: ENVIRONMENT
};

console.log('Starting deployment for ' + ENVIRONMENT);

function readModuleFile (path, callback) {
    try {
        var filename = require.resolve(path);
        fs.readFile(filename, 'utf8', callback);
    } catch (e) {
        callback(e);
    }
}

console.log('Building dockerrun template');

readModuleFile('./Dockerrun.aws.json.mustache', function (err, template) {
	var output = mustache.render(template, data);

	var ws = fs.createWriteStream('./deploy/Dockerrun.aws.json');
	ws.write(output);

    console.log('Finished!');

    // TODO: Eb call
});

