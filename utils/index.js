const chalk = require('chalk');

module.exports = {
    inform: function(text){
        console.log(chalk.blue(text));
    },

    alert: function(text){
        console.log(chalk.magenta(text));
    }
}
