
function warn () {
  try {
    const chalk = require('chalk')
    console.warn(chalk.hex('#e03045')(...arguments))
  }
  catch (err) {
    console.warn(...arguments)
  }
}

function info () {
  try {
    const chalk = require('chalk')
    console.log(chalk.hex('#4eada5')(...arguments))
  }
  catch (err) {
    console.log(...arguments)
  }
}

module.exports = {
  warn,
  info,
}
