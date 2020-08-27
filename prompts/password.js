var inquirer = require('inquirer');
module.exports = () => {
    return new Promise((resolve, reject) => {
        inquirer.prompt([
            {
                type: 'password',
                name: 'handle',
                message: 'Your password:'
            }
        ]).then(answers => {
            resolve(answers.handle)
        }).catch(e => reject(e));
    })
}