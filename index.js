const figlet = require('figlet');
const packageJson = require('./package.json');
const version = packageJson.version;
const chalk = require('chalk');
const config = require('./config');
const cf = require('./codeforces');
const prompts = require('./prompts/index')
const colorHandle = require('./handle');
const clear = require('clear');
const open = require('open');
const WebSocket = require('ws');

let duels = async () => {
    return new Promise(resolve => {
        const ws = new WebSocket("wss://l6wnmfy9ra.execute-api.us-east-1.amazonaws.com/dev");

        let queue = [];
        let handles = []
        let inQueue = false;

        let sendInvitation = async (man) => {
            await ws.send(JSON.stringify({
                action: 'sendMessage',
                channelId: "General",
                name: config.get('handle'),
                content: {
                    rating: (await cf.getUser(config.get('handle'))).result[0].rating,
                    ask: man
                }
            }));
        }

        let last = 0;

        let ask = async () => {
            let kek = Math.random();
            last = kek;
            let resp = await prompts.queue(queue);
            if(last !== kek) return ;
            if(resp === "Cancel") ws.close();
            else if(resp === "Join queue"){
                inQueue = true;
                await sendInitial();
                await clear();
                console.log(chalk.yellow("Wait your opponent :)"))
            } else{
                await clear();
                console.log("Wait your opponent's answer");
                await sendInvitation(handles[queue.indexOf(resp)]);
            }
        }

        ws.on('open', async () => {
            console.log(chalk.green("WS connection ok"));
            await ask();
        })

        ws.on('close', () => {
            console.log(chalk.red("WS disconnect"));
            resolve();
        })


        let sendInitial = async () => {
            await ws.send(JSON.stringify({
                action: 'sendMessage',
                channelId: "General",
                name: config.get('handle'),
                content: {
                    rating: (await cf.getUser(config.get('handle'))).result[0].rating,
                    queue: true
                }
            }));
        }


        ws.on('message', async (data) => {
            // console.log(data);
            let req = JSON.parse(data);
            if(req.content)
                req.content = JSON.parse(req.content);
            if (req.event === 'channel_message') {
                if(req.name === config.get('handle')) return ;
                if(req.content.queue){
                    if(handles.indexOf(req.name) !== -1) return ;
                    queue.push(colorHandle(req.name, req.content.rating) + `. Rating: ${req.content.rating}`);
                    handles.push(req.name);
                    // console.log(queue);
                    clear();
                    if(!inQueue)
                        await ask();
                } else if(req.content.ask === config.get('handle')){
                    clear();
                    let resp = await prompts.invite(colorHandle(req.name, req.content.rating) + `, rating: ${req.content.rating} invited you to duel`);
                    let task = null;
                    if(resp === "Accept"){
                        let hardness = (req.content.rating + (await cf.getUser(config.get('handle'))).result[0].rating) / 2;
                        let problems = await cf.getTasks();
                        let canBe = [];
                        problems.result.problems.forEach(e => {
                            if(e.rating && Math.abs(hardness - e.rating) < 100){
                                canBe.push(e);
                            }
                        })
                        let asubm = await cf.getSubmissions(req.name);
                        asubm.result.forEach(e => {
                            let index = -1;
                            for(let i = 0; i < canBe.length; i++){
                                if(e.problem.contestId === canBe[i].contestId && e.problem.index === canBe[i].index)
                                    index = i;
                            }
                            if(index !== -1) canBe.splice(index, 1);
                        });
                        let bsubm = await cf.getSubmissions(req.content.ask);
                        bsubm.result.forEach(e => {
                            let index = -1;
                            for(let i = 0; i < canBe.length; i++){
                                if(e.problem.contestId === canBe[i].contestId && e.problem.index === canBe[i].index)
                                    index = i;
                            }
                            if(index !== -1) canBe.splice(index, 1);
                        });
                        let ind = Math.floor(Math.random() * canBe.length);
                        task = canBe[ind].contestId + '/' + canBe[ind].index;
                    }
                    await ws.send(JSON.stringify({
                        action: 'sendMessage',
                        channelId: "General",
                        name: config.get('handle'),
                        content: {
                            asked: req.name,
                            response: (resp === 'Accept'),
                            task: task,
                        }
                    }));
                    let got = [];
                    if(resp === "Accept"){
                        clear();
                        console.log("---------------------------");
                        console.log("Your task is " + task);
                        console.log("Your opponent is " + req.name);
                        console.log("---------------------------");
                        let spl = task.indexOf('/');
                        open('https://codeforces.com/contest/' + task.substr(0, spl) + '/problem/' + task.substr(spl + 1));
                        inQueue = false;
                        setInterval(async () => {
                            let asubm = await cf.getSubmissions(req.name);
                            asubm.result.forEach(e => {
                                let t = e.problem.contestId + '/' + e.problem.index;
                                if(e.verdict !== "TESTING" && e.verdict && t === task && got.indexOf(e.id) === -1){
                                    got.push(e.id);
                                    if(e.verdict !== "OK")
                                        console.log(chalk.red(req.name + " got " + e.verdict + " on test " + (e.passedTestCount - 1 + 2)));
                                    else {
                                        console.log(chalk.green(req.name + " got AC"));
                                        ws.close();
                                    }
                                }
                            });
                            let bsubm = await cf.getSubmissions(req.content.ask);
                            bsubm.result.forEach(e => {
                                let t = e.problem.contestId + '/' + e.problem.index;
                                if(e.verdict !== "TESTING" && e.verdict && t === task && got.indexOf(e.id) === -1){
                                    got.push(e.id);
                                    if(e.verdict !== "OK")
                                        console.log(chalk.red(req.content.ask + " got " + e.verdict + " on test " + (e.passedTestCount - 1 + 2)));
                                    else {
                                        console.log(chalk.green(req.content.ask + " got AC"));
                                        ws.close();
                                    }
                                }
                            });
                        }, 1000);
                    }
                } else if(req.content.asked === config.get('handle')){
                    if(!req.content.response){
                        console.log(req.name + " declined your invitation.");
                        await ask();
                    } else{
                        clear();
                        let task = req.content.task;
                        console.log("---------------------------");
                        console.log("Your task is " + task);
                        console.log("Your opponent is " + req.name);
                        console.log("---------------------------");
                        let got = [];
                        let spl = task.indexOf('/');
                        open('https://codeforces.com/contest/' + task.substr(0, spl) + '/problem/' + task.substr(spl + 1));
                        inQueue = false;
                        setInterval(async () => {
                            let asubm = await cf.getSubmissions(req.name);
                            asubm.result.forEach(e => {
                                let t = e.problem.contestId + '/' + e.problem.index;
                                if(e.verdict !== "TESTING" && e.verdict && t === task && got.indexOf(e.id) === -1){
                                    got.push(e.id);
                                    if(e.verdict !== "OK")
                                        console.log(chalk.red(req.name + " got " + e.verdict + " on test " + (e.passedTestCount - 1 + 2)));
                                    else {
                                        console.log(chalk.green(req.name + " got AC"));
                                        ws.close();
                                    }
                                }
                            });
                            let bsubm = await cf.getSubmissions(req.content.asked);
                            bsubm.result.forEach(e => {
                                let t = e.problem.contestId + '/' + e.problem.index;
                                if(e.verdict !== "TESTING" && e.verdict && t === task && got.indexOf(e.id) === -1){
                                    got.push(e.id);
                                    if(e.verdict !== "OK")
                                        console.log(chalk.red(req.content.asked + " got " + e.verdict + " on test " + (e.passedTestCount - 1 + 2)));
                                    else {
                                        console.log(chalk.green(req.content.asked + " got AC"));
                                        ws.close();
                                    }
                                }
                            });
                        }, 1000);
                    }
                } else if(req.content.response){
                    let ind = handles.indexOf(req.name);
                    handles.splice(ind, 1);
                    queue.splice(ind, 1);
                    clear();
                    await ask();
                }
            } else if(req.event === 'subscriber_sub'){
                // console.log(inQueue);
                if(inQueue)
                    await sendInitial();
            }
        });
    });
}

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
                console.log(`Average rating - ${Math.floor(sum/cnt)}`);
                objs.forEach(e => {
                    console.log(`${e.tag}: ${e.ok} solved, ${e.all} submissions, ${e.avg} - average task rating`);
                })
            }).catch(e => console.log(e));
        }
        if(selection === 'Duels'){
            clear();
            await duels();
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


