'use babel'

import { CompositeDisposable } from 'atom'
import View from './views/MapEntryEditor'

import MIDIService from './service'

let subscriptions

export let service

export const config = require('../config.json')

const addHandler    = () => service.defineHandler()

const clearHandlers = () => service.clearHandlers()

export function activate () {
  service = new MIDIService()
  subscriptions = new CompositeDisposable()
  subscriptions.add(
    service,
    atom.commands.add('atom-workspace', 'midi-controlled:restart', restartService),
    atom.commands.add('atom-workspace', 'midi-controlled:add-handler', addHandler),
    atom.commands.add('atom-workspace', 'midi-controlled:clear-handlers', clearHandlers)
  )
}

export function deactivate () {
  service.stop()
  subscriptions.dispose()
}

export function restartService () {
  if (service)
    service.restart()
}
