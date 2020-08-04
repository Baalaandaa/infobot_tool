var inquirer = require('inquirer');
module.exports = () => {
    return new Promise((resolve, reject) => {
        inquirer.prompt([
            {
                type: 'input',
                name: 'key',
                message: 'To use this tool, provide API key from https://codeforces.com/settings/api'
            }
        ]).then(answers => {
            resolve(answers.key)
        }).catch(e => reject(e));
    })
}