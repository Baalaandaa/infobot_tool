const figlet = require('figlet');
const packageJson = require('./package.json');
const version = packageJson.version;
const chalk = require('chalk');
const config = require('./config');

const prompts = require('./prompts/index')

module.exports = () => {
    figlet.text("Infobot", {}, async (e, d) => {
        console.log(chalk.blue(d));
        console.log(chalk.yellow(`Current version: ${version}`));
        if (!config.get('key')) config.set('key', await prompts.apiKey());
        if (!config.get('secret')) config.set('secret', await prompts.apiSecret());
    });
}


