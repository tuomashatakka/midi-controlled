'use babel'

import self from 'autobind-decorator'
import { resolve } from 'path'
import { composeCallback, getDirectory } from '../dispatch'
import MIDIMessage from './MIDIMessage'

let callbacks = new WeakMap()

export default class MapEntry {

  constructor (options, src) {
    this.filename = 'note' + options.note
    this.message  = new MIDIMessage(options)
    this.source   = src
    this.id       = generate_id()
  }

  getTitle () {
    return this.key
  }

  get key () {
    return this.message.note
  }

  @self
  async getCallback () {
    if (!callbacks.has(this))
      callbacks.set(this, await composeCallback(this))
    return callbacks.get(this)
  }

  @self
  async call () {
    let fn = await this.getCallback()
    atom.notifications.addSuccess("Dispatching a callback for " + this.key)
    console.info("fn =", fn)
    return fn(this)
  }

  @self
  openScriptFile () {
    let path = resolve(getDirectory(), this.filename)
    atom.workspace.open(path)
  }

  @self
  toJSON () {
    return this.message.toJSON()
  }
}

const generate_id = () => '_' + parseInt(Math.random() * 1000000000).toString(25)
