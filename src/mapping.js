const chalk       = require('chalk')
const { spawn }   = require('child_process')

const THRESHOLD = 3
const APP_NAME = 'fi.fns.telemedicine'
const options = {
  cwd: '/Users/tuomas/Projects/Viivi/mobile/'
}

module.exports = {
  /* PAD 1 */     52: () => {},
  /* PAD 2 */     53: () => reloadRN(),
  /* PAD 3 */     55: start(APP_NAME + '.MainApplication'),
  /* PAD 4 */     57: kill(APP_NAME),
  /* PAD 5 */     45: () => run_subprocess(true, 'npm run adb'),
  /* PAD 6 */     47: () => run_subprocess(true, 'npm run android'),
  /* PAD 7 */     48: () => reloadRN(),
  /* PAD 8 */     50: () => run_subprocess(true, 'npm start'),

  /* KNOB 2/1 */  12: scroll,
  /* KNOB 2/2 */  13: () => {},
  /* KNOB 2/3 */  14: () => {},
  /* KNOB 2/4 */  15: () => {},

  /* KNOB 1/1 */   8: () => {},
  /* KNOB 1/2 */   9: () => {},
  /* KNOB 1/3 */  10: () => {},
  /* KNOB 1/4 */  11: () => {},
}

let info = (...msg) => console.log(chalk.hex('#3dcc8c')(...msg))
let warn = (...msg) => console.warn(chalk.hex('#ff40a0')(...msg))

let subproc
let subprocesses = new Set()

async function run_subprocess (...arg) {

  let exclusive = false
  console.log(...arg)

  if (arg.length)
    if (arg[0] === false || arg[0] === true)
      exclusive = arg.shift()
  arg = arg.join(' && ')

  info('Starting a subprocess', exclusive ? 'exclusively' : '')
  if (exclusive && subproc)
    subproc.kill()

  let args = arg.split(' ')
  let command = args.shift()

  return await new Promise (resolve => {
    let exec = exclusive
      ? (...args) => {
        subproc = fn(...args)
        subprocesses.add(subproc)
        return subproc
      }
      : (...args) => {
        let sub = spawn(...args)
        subprocesses.add(sub)
        return sub
      }

    let proc = exec(command, args, options)
    info(command, ...args)

    proc.stdout.on('data', data => info(data.toString()))
    proc.stderr.on('data', data => warn(data.toString()))
    proc.on('exit', data => {
      info("Subprocess", command, "ended", data)
      subprocesses.delete(proc)
      resolve(data)
    })
  })
}

async function reloadRN () {
  run_subprocess('adb shell input keyevent 82')
  setTimeout(() => run_subprocess('adb shell input keyevent 66'), 2000)
}

function kill (name) {
  return () => run_subprocess('adb shell am force-stop ' + name)
}
function start (name) {
  return () => run_subprocess('adb shell am start ' + name)
}


let previousDirection = false
let previousValue = 0

function scroll ({ velocity }) {

  let direction = velocity > previousValue
  let thresholdPassed = previousDirection !== direction || Math.abs(velocity - previousValue) >= THRESHOLD

  console.log("direction:", direction, "\nvalue:", velocity, '/', previousValue)

  if (!thresholdPassed)
    return
  if (direction)
    run_subprocess('adb shell input keyevent 20')
  else
    run_subprocess('adb shell input keyevent 19')

  previousValue = velocity
  previousDirection = direction
}
