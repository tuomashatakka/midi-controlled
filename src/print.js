
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

function success () {
  try {
    const chalk = require('chalk')
    console.log(chalk.hex('#4eada5')(...arguments))
  }
  catch (err) {
    console.info(...arguments)
  }
}

function failed () {
  try {
    const chalk = require('chalk')
    console.log(chalk.hex('#f2286b')(...arguments))
  }
  catch (err) {
    console.info(...arguments)
  }
}

module.exports = {
  warn,
  info,
  success,
  failed,
}
