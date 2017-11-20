'use babel'

/**
 * @flow
 */

import self from 'autobind-decorator'

import { Emitter } from 'event-kit'
import CallbackManager from './Map'
import Devices from './MIDIDeviceRegistry'
import Message from './MIDIMessage'

const signal = Symbol('midi-events-handler')

export default class MIDIHandler {

  constructor (midi) {
    this[signal]  = new Emitter()
    this.mappings = new CallbackManager(this)
    this.registry = new Devices(midi)
    this.registry.onInput(this.dispatch)
    this.registry.onStateChange(state => {
      console.info(state)
      atom.notifications.addInfo('MIDI State change event occurred. State changed to ' + state)
    })
    this.previous = {}
  }

  onKeyDown (note, callback) {
    note = parseInt(note)
    let assertNote = message => {
      console.log("parseInt(message.note) === note", parseInt(message.note) === note, parseInt(message.note), note)
      return parseInt(message.note) === note &&
      message.type > 128 &&
      message.velocity > 0
    }
    return this.registerWithCondition('message', callback, assertNote)
  }

  onKeyUp (note, callback) {
    note = parseInt(note)
    let assertNoteup = message =>
      parseInt(message.note) === note &&
      message.type > 128 &&
      message.velocity === 0
    return this.registerWithCondition('message', callback, assertNoteup)
  }

  onDidDestroy (callback) {
    this[signal].on('did-destroy', callback)
  }

  @self
  dispatch (device, event) {
    let message = Message.from(event)
    this[signal].emit('message', message)
    this.previous = message
    new Notification(`Received MIDI ∫${message.note} ▸ ${message.velocity}`)
  }

  @self
  registerWithCondition (eventName, callback, ...filters) {
    let handler = constructConditionalCallback(callback, ...filters)
    return this[signal].on(eventName, handler)
  }

  @self
  registerWithParams (eventName, params, callback) {
    return this[signal].on(eventName, (args) => callback(args))
  }

  get disposed () {
    return this[signal].disposed && this.registry.disposed
  }

  @self
  dispose () {
    this.registry.destroy()
    this[signal].dispose()
    this[signal].emit('did-destroy')
  }

  @self
  destroy () {
    this.dispose()
  }
}


function constructConditionalCallback (callback, ...filters) {
  return (...args) => {
    let allow = filters.reduce((allow, fn) => allow && fn(...args), true)
    if (allow)
      require('../print').success(args[0].toJSON(), '-> SUCCESS')
    else
      require('../print').failed(args[0].toJSON(), '-> FAILED')
    return allow && callback(...args)
  }
}

class Notification {
  constructor (message) {
    let type = 'info'
    this.notification = atom.notifications.add(type, message)
    console.log(this)
  }
}
