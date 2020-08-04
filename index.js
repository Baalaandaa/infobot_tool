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
        cf.getSubmissions(config.get('handle')).then(e => {
            let resp = {};
            let sum = 0, cnt = 0;
            e.result.forEach(submission => {
                let problem = submission.problem;
                if(submission.verdict === 'OK' && problem.rating && problem.tags) {
                    sum += problem.rating;
                    cnt++;
                    problem.tags.forEach(e => {
                        if (!resp[e]) resp[e] = [];
                        resp[e].push(problem.rating);
                    })
                }
            });
            console.log(Math.floor(sum / cnt));
            let objs = [];
            Object.keys(resp).forEach(key => {
                let min = 50000, max = 0;
                let sum = 0;
                resp[key].forEach(v => {
                    sum += v;
                    min = Math.min(v, min);
                    max = Math.max(v, max);
                })
                objs.push({
                    tag: key,
                    min: min,
                    max: max,
                    avg: Math.floor(sum / resp[key].length)
                });
            });
            objs.sort((a, b) => {
                return a.max - b.max;
            });
            console.log(chalk.red("Слабые темы"));
            objs.forEach((e, index) => {
                if(index < 5) console.log(`${e.tag}: max(${e.max}), min(${e.min}), avg(${e.avg})`);
                if(index === objs.length - 5)
                    console.log(chalk.green("Сильные темы"));
                if(index >= objs.length - 5)
                    console.log(`${e.tag}: max(${e.max}), min(${e.min}), avg(${e.avg})`);
            });

        }).catch(e => console.log(e));
    });
}


