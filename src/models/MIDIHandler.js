'use babel'

/**
 * @flow
 */

import { Emitter } from 'event-kit'
import { info } from '../print'
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
    this.previous = {}
  }

  onNoteInput (note, callback) {
    let assertNote = message => !(
      message.type > 128 &&
      message.type < 136 &&
      message.note === this.previous.note
    )
    return this.registerWithCondition('message', callback, assertNote)
  }

  onDidDestroy (callback) {
    this[signal].on('did-destroy', callback)
  }

  dispatch (event) {
    let message   = Message.from(event)
    this[signal].emit('message', message)
    this.previous = message
    new Notification(`Received MIDI ∫${message.note} ▸ ${message.velocity}`)
  }

  registerWithCondition (eventName, callback, ...filters) {
    let handler = constructConditionalCallback(callback, ...filters)
    return this[signal].on(eventName, handler)
  }

  registerWithParams (eventName, params, callback) {
    return this[signal].on(eventName, (args) => callback(args))
  }

  dispose () {
    this[signal].dispose()
    this[signal].emit('did-destroy')
  }
}


function constructConditionalCallback (callback, ...filters) {
  return (...args) => {
    let allow = filters.reduce((allow, fn) => allow && fn(...args), true)
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
