'use babel'

import { CompositeDisposable } from 'atom'

import MIDIService from './service'
import registerView from './views/MapEntryEditor'


let service
let subscriptions

export const config = require('../config.json')

export function deactivate () {
  subscriptions.dispose()
}

export function activate () {
  service = new MIDIService()
  subscriptions = new CompositeDisposable()
  subscriptions.add(
    service,
    registerView(),
    defineCommand('learn', toggleMIDILearn),
    defineCommand('add-handler', addHandler),
    defineCommand('clear-handlers', clearHandlers),
    defineCommand('restart', restartService)
  )
}

const defineCommand = (name, callback) =>
  atom.commands.add('atom-workspace', 'midi-controlled:' + name, callback)


const toggleMIDILearn = () => service.toggleMIDILearn()
const addHandler      = () => service.defineHandler()
const clearHandlers   = () => service.clearHandlers()
const restartService  = () => service ?
  (service.restart()) :
  (service = new MIDIService())
