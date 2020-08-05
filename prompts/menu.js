var inquirer = require('inquirer');
const clear = require('clear');
module.exports = () => {
    return new Promise((resolve, reject) => {
        inquirer.prompt([
            {
                type: 'list',
                name: 'menu',
                message: 'Select menu option:',
                choices: [
                    'Get profile analisys',
                    'Duels(not supported yet)',
                    'Exit'
                ]
            }
        ]).then(answers => {
            clear();
            resolve(answers.menu)
        }).catch(e => reject(e));
    })
}