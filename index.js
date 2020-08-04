const figlet = require('figlet');
const packageJson = require('./package.json');
const version = packageJson.version;
const chalk = require('chalk');
const config = require('./config');
const cf = require('./codeforces');
const prompts = require('./prompts/index')
const colorHandle = require('./handle');

module.exports = () => {
    figlet.text("Infobot", {}, async (e, d) => {
        console.log(chalk.blue(d));
        console.log(chalk.yellow(`Current version: ${version}`));
        if (!config.get('handle')) config.set('handle', await prompts.handle());
        if (!config.get('key')) config.set('key', await prompts.apiKey());
        if (!config.get('secret')) config.set('secret', await prompts.apiSecret());
        cf.getUser(config.get('handle')).then(e => console.log('Привет, ' + colorHandle(e.result[0].handle, e.result[0].rating))).catch((e) => console.log(e));
    });
}


