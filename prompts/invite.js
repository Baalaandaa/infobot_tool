var inquirer = require('inquirer');
const clear = require('clear');
module.exports = (kek) => {
    return new Promise((resolve, reject) => {
        inquirer.prompt([
            {
                type: 'list',
                name: 'menu',
                message: kek,
                choices: [
                    'Accept',
                    'Decline'
                ]
            }
        ]).then(answers => {
            clear();
            resolve(answers.menu)
        }).catch(e => reject(e));
    })
}