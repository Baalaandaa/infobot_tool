const figlet = require('figlet');
const packageJson = require('./package.json');
const version = packageJson.version;
const chalk = require('chalk');
const config = require('./config');
const cf = require('./codeforces');
const prompts = require('./prompts/index')
const colorHandle = require('./handle');
const clear = require('clear');
let menu = async () => {
    while(1){
        let selection = await prompts.menu();
        if(selection === 'Get profile analisys'){
            clear();
            cf.getSubmissions(config.get('handle')).then(async e => {
                let resp = {};
                let all = {}
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
                    if(problem.rating && problem.tags){
                        problem.tags.forEach(e => {
                            if (!all[e]) all[e] = 0;
                            all[e]++;
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
                        ok: resp[key].length,
                        all: all[key],
                        avg: Math.floor(sum / resp[key].length)
                    });
                });
                objs.sort((a, b) => {
                    return (a.ok / a.all * a.ok / cnt) - (b.ok / b.all * b.ok / cnt);
                });
                console.log(`Ваш средний рейтинг - ${Math.floor(sum/cnt)}`);
                objs.forEach(e => {
                    console.log(`${e.tag}: ${e.ok} решено, ${e.all} попыток, ${e.avg} - средний рейтинг задач`);
                })
            }).catch(e => console.log(e));
        }
        if(selection === 'Duels'){
            console.log("Is not supported yet");
        }
        if(selection === 'Exit') break;
    }
}

module.exports = () => {
    figlet.text("Infobot", {}, async (e, d) => {
        console.log(chalk.blue(d));
        console.log(chalk.yellow(`Current version: ${version}`));
        if (!config.get('handle')) config.set('handle', await prompts.handle());
        if (!config.get('key')) config.set('key', await prompts.apiKey());
        if (!config.get('secret')) config.set('secret', await prompts.apiSecret());
        // cf.getUser(config.get('handle')).then(e => console.log('Привет, ' + colorHandle(e.result[0].handle, e.result[0].rating))).catch((e) => console.log(e));
        await menu();
    });
}


