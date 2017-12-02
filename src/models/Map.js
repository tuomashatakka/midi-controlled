'use babel'

import { CompositeDisposable } from 'event-kit'
import { clearScripts } from '../dispatch'
import Entry from './MapEntry'

const CONFIG_DESCRIPTOR = 'midi-controlled.handlers.noteon'
const subscriptions = Symbol('subscriptions')

export default class MIDIMap {

  entries = new Set()

  constructor (host) {
    this.host = host
    this[subscriptions] = new CompositeDisposable()
    this.load(atom.config.get(CONFIG_DESCRIPTOR))
  }

  add (entry) {
    let subscr = this.host.onKeyDown(entry.key, entry.call)
    // let subscr = this.host.onKeyUp(entry.key, entry.call)

    entry.host = this.host
    this[subscriptions].add(subscr)
    this.entries.add(entry)
    this.save()
  }

  load (data) {
    let noteonHandlers = data
    for (let note in noteonHandlers)
      this.add(new Entry({ note }, noteonHandlers[note]))
    console.log("Entries", ...this.entries)
  }

  save () {
    let serializedHandlers = this.toJSON()
    console.log("serializedHandlers", serializedHandlers)
    atom.config.set(CONFIG_DESCRIPTOR, serializedHandlers)
  }

  clear () {
    this[subscriptions].dispose()
    this.entries.clear()
    clearScripts()
  }

  toJSON () {
    let serializedHandlers = {}
    this.entries.forEach(entry => serializedHandlers[entry.key] = entry.source)
    return serializedHandlers
  }

}
