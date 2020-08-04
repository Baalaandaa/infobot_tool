const Configstore = require('configstore');
const packageJson = require('./package.json');
const config = new Configstore(packageJson.name, {foo: 'bar'});
module.exports = config;