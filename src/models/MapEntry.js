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

    let callback  = composeCallback(this)
    callbacks.set(this, callback)
  }

  getTitle () {
    return this.key
  }

  get key () {
    return this.message.note
  }

  get callback () {
    return callbacks.get(this)
  }

  @self
  async call () {
    let fn = await this.callback
    return fn(this)
  }

  openScriptFile () {
    let path = resolve(getDirectory(), this.filename)
    atom.workspace.open(path)
  }

  toJSON () {
    return this.message.toJSON()
  }
}

const generate_id = () => '_' + parseInt(Math.random() * 1000000000).toString(25)
