'use babel'
import { CompositeDisposable, Disposable } from 'event-kit'

const subscriptions = Symbol('subscriptions')

export default class MIDIDeviceRegistry {

  constructor (midi) {
    this.midi    = midi
    this.inputs  = midi.inputs
    this.outputs = midi.outputs
    this[subscriptions] = new CompositeDisposable()
  }

  forEachInput (fn) {
    let results = []
    let handle  = device => results.push(fn(device))
    this.inputs.forEach(handle)
    return results
  }

  addInputEventListener (eventName, callback) {
    this.forEachInput((device) => {
      console.log("Binding event listeners for ", eventName, "to device", device)
      let handler = (event) => callback(device, event)
      try {
        device.addEventListener(eventName, handler)
        const subscription = new Disposable(() => device.removeEventListener(eventName, handler))
        this[subscriptions].add(subscription)
        console.info("Successfully bound listeners for ", eventName, "to device", device)
      }
      catch (error) {
        displayError(error)
        console.warn("Error while binding listeners for ", eventName, "to device", device, '\n', error)
      }
    })
  }

  addEventListener (eventName, callback) {
    let device = this.midi
    let handler = (event) => callback(device, event)
    device.addEventListener(eventName, handler)
    const subscription = new Disposable(() => device.removeEventListener(eventName, handler))
    this[subscriptions].add(subscription)
  }

  onInput (callback) {
    this.addInputEventListener('midimessage', callback)
  }

  onStateChange (callback) {
    this.addEventListener('statechange', callback)
  }

  get disposed () {
    return this[subscriptions].disposed
  }

  dispose () {
    this[subscriptions].dispose()
  }

  destroy () {
    this.dispose()
  }
}

function displayError (error) {
  atom.notifications.addError(error.message, {
    dismissable: true,
    description: "<h3><i class='icon icon-issue-reopened'></i>${error.name}</h3>",
    detail:      error.stack,
  })
}
