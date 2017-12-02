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

export default class MIDIEventHandler {

  static LEARN_EVENT_LABEL = 'learn'
  static MESSAGE_EVENT_LABEL = 'message'

  constructor (midi) {
    this.learnActive = false
    this[signal]  = new Emitter()
    this.registry = new Devices(midi)
    this.mappings = new CallbackManager(this)

    const formatRegistry = () => {
      this.registry.destroy()
      this.registry.onInput(this.dispatch)
      this.registry.onStateChange(state => {
        console.info(state)
        formatRegistry()
        new Notification('MIDI State change event occurred. State changed to ' + state)
      })
    }

    formatRegistry()
  }

  enableLearn (handleLearn) {
    this.learnActive = true
    this.learnHandlerSubscription =
      this.registerLearnHandler(handleLearn)
  }

  disableLearn () {
    this.learnActive = false
    if (this.learnHandlerSubscription)
      this.learnHandlerSubscription.dispose()
  }

  onKeyDown (note, callback) {
    let condition = assertNote(parseInt(note))
    return this.registerWithCondition(MIDIEventHandler.MESSAGE_EVENT_LABEL, callback, condition)
  }

  onKeyUp (note, callback) {
    let condition = assertNoteup(parseInt(note))
    return this.registerWithCondition(MIDIEventHandler.MESSAGE_EVENT_LABEL, callback, condition)
  }

  @self
  registerLearnHandler (callback) {
    let eventName = MIDIEventHandler.LEARN_EVENT_LABEL
    return this[signal].on(eventName, callback)
  }

  @self
  registerWithCondition (eventName, callback, ...filters) {
    let handler = constructConditionalCallback(callback, ...filters)
    return this[signal].on(eventName, handler)
  }

  onDidDestroy (callback) {
    this[signal].on('did-destroy', callback)
  }

  @self
  dispatch (device, event) {
    let message = Message.from(event)
    let eventName = this.learnActive ?
      MIDIEventHandler.LEARN_EVENT_LABEL :
      MIDIEventHandler.MESSAGE_EVENT_LABEL
    this[signal].emit(eventName, message)
    new Notification(`Received MIDI ∫${message.note} ▸ ${message.velocity}`)
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

let assertNote = note => message =>
  parseInt(message.note) === note &&
    message.type > 128 &&
    message.velocity > 0

let assertNoteup = note => message =>
  parseInt(message.note) === note &&
  message.type > 128 &&
  message.velocity === 0



// FIXME: Move to own file
class Notification {
  constructor (message) {
    let type = 'info'
    this.notification = atom.notifications.add(type, message)
    console.log(this)
  }
}
