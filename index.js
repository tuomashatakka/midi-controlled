const chalk = require('chalk')
const watch = require('node-watch')
const child = require('child_process')

let info = (msg) => console.log(chalk.hex('#ff40a0')(msg))

let subproc

function execut () {
  info('Restarting the subprocess for the MIDI listener')
  if (subproc)
    subproc.kill()
  subproc = child.spawn('node', [ 'midi' ])
  subproc.stdout.on('data', data => console.log(data.toString()))
  subproc.stderr.on('data', data => console.log(data.toString()))
}

watch([ __dirname ], execut)
execut()
