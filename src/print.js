
function warn () {
  try {
    const chalk = require('chalk')
    console.warn(chalk.hex('#e03045')(...arguments)) // eslint-disable-line no-console
  }
  catch (err) {
    console.warn(...arguments) // eslint-disable-line no-console
  }
}

function info () {
  try {
    msg('#3d63e8', ...arguments)
  }
  catch (err) {
    console.log(...arguments) // eslint-disable-line no-console
  }
}

function success () {
  try {
    msg('#4eada5', ...arguments)
  }
  catch (err) {
    console.info(...arguments) // eslint-disable-line no-console
  }
}

function failed () {
  try {
    msg('#f2286b', ...arguments)
  }
  catch (err) {
    console.info(...arguments) // eslint-disable-line no-console
  }
}

function msg () {
  let items = [ ...arguments ]
  const color = items.shift()
  const chalk = require('chalk')
  return items.map(item =>
    typeof item === 'string'
    ? chalk.hex(color)(item)
    : item
  )
}

module.exports = {
  warn,
  info,
  success,
  failed,
}
