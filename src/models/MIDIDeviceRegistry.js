'use babel'
import { CompositeDisposable, Disposable } from 'event-kit'

const subscriptions = Symbol('subscriptions')

export default class MIDIDeviceRegistry {

  constructor (midi) {
    this.outputs = midi.outputs
    this.inputs  = midi.inputs
    this[subscriptions] = new CompositeDisposable()
  }

  forEachInput (fn) {
    return [...this.inputs].map(device => fn(device))
  }

  addInputEventListener (eventName, callback) {
    this.forEachInput((device) => {
      let handler = (event) => callback(device, event)
      const subscription = new Disposable(() => device.removeEventListener('midimessage', handler))
      device.addEventListener(eventName, handler)
      this[subscriptions].add(subscription)
    })
  }

  onInput (callback) {
    this.addInputEventListener('midimessage', callback)
  }

  dispose () {
    this[subscriptions].dispose()
  }
}
