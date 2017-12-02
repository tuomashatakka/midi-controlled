'use babel'
import { CompositeDisposable, Disposable } from 'event-kit'

const subscriptions = Symbol('subscriptions')
const subscriptionsByDevice = Symbol('subscriptions-by-midi-device')

class WeakCollection {

  constructor () {
    this.map = new WeakMap()
  }

  get (key) {
    if (!this.map.has(key))
      this.map.set(key, new Set())
    return this.map.get(key)
  }

  insert (key, entry) {
    let entries = this.get(key)
    entries.add(entry)
    this.map.set(key, entries)
    return entries
  }

  map (key, fn) {
    let entries = this.map.get(key)
    return Array.from(entries).map(fn)
  }

}

export default class MIDIDeviceRegistry {

  constructor (midi) {
    this.midi    = midi
    this.inputs  = midi.inputs
    this.outputs = midi.outputs
    this[subscriptions] = new CompositeDisposable()
    this[subscriptionsByDevice] = new WeakCollection()
  }

  updateInputs

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
        const subscription = listen(device, eventName, handler)
        this[subscriptions].add(subscription)
        this[subscriptionsByDevice].insert(device, subscription)
        console.info("Successfully bound listener for ", eventName, "to device", device)
      }
      catch (error) {
        displayError(error)
        console.warn("Error while binding listener for ", eventName, "to device", device, '\n', error)
      }
    })
  }

  removeInputEventListeners (device) {
    let dispose = entry => entry.dispose()
    this[subscriptionsByDevice].map(device, dispose)
  }

  addEventListener (eventName, callback) {
    let device = this.midi
    let handler = (event) => callback(device, event)
    const subscription = listen(device, eventName, handler)
    this[subscriptions].add(subscription)
  }

  onStateChange (callback) {
    this.addEventListener('statechange', callback)
  }

  onInput (callback) {
    this.addInputEventListener('midimessage', callback)
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

function listen (target, eventName, callback) {
  target.addEventListener(eventName, callback)
  return new Disposable(() => target.removeEventListener(eventName, callback))
}

function displayError (error) {
  atom.notifications.addError(error.message, {
    dismissable: true,
    description: "<h3><i class='icon icon-issue-reopened'></i>${error.name}</h3>",
    detail:      error.stack,
  })
}
