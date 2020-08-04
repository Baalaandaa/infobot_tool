var inquirer = require('inquirer');
module.exports = () => {
    return new Promise((resolve, reject) => {
        inquirer.prompt([
            {
                type: 'input',
                name: 'secret',
                message: 'To use this tool, provide API secret from https://codeforces.com/settings/api'
            }
        ]).then(answers => {
            resolve(answers.secret)
        }).catch(e => reject(e));
    })
}