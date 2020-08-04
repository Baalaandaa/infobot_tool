const chalk = require('chalk');

module.exports = (name, rating) => {
    if(!rating) return 'wtf lol';
    if(rating < 1200) return chalk.gray(name);
    else if(rating < 1400) return chalk.green(name);
    else if(rating < 1600) return chalk.cyan(name);
    else if(rating < 1900) return chalk.blue(name);
    else if(rating < 2100) return chalk.hex('#800080')(name);
    else if(rating < 2300) return chalk.yellow(name);
    else if(rating < 2400) return chalk.hex('#ff6600')(name);
    else if(rating < 2600) return chalk.red(name);
    else if(rating < 3000) return chalk.bold.redBright(name);
    else return chalk.black(name.substr(0, 1)) + chalk.bold.redBright(name.substr(1));
}