var inquirer = require('inquirer');
module.exports = () => {
    return new Promise((resolve, reject) => {
        inquirer.prompt([
            {
                type: 'input',
                name: 'handle',
                message: 'Your handle:'
            }
        ]).then(answers => {
            resolve(answers.handle)
        }).catch(e => reject(e));
    })
}