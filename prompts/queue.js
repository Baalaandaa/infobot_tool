var inquirer = require('inquirer');
const clear = require('clear');
module.exports = (queue) => {
    return new Promise((resolve, reject) => {
        inquirer.prompt([
            {
                type: 'list',
                name: 'queue',
                message: 'Select your opponent or join queue:',
                choices: [
                    ...queue,
                    'Cancel',
                    'Join queue'
                ]
            }
        ]).then(answers => {
            clear();
            resolve(answers.queue)
        }).catch(e => reject(e));
    })
}