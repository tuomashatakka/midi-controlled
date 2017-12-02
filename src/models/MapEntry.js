'use babel'

import self from 'autobind-decorator'
import { resolve } from 'path'
import { CompositeDisposable } from 'event-kit'
import { composeCallback, getDirectory } from '../dispatch'
import MIDIMessage from './MIDIMessage'

let callbacks = new WeakMap()

export default class MapEntry {

  constructor (options, src) {
    this.filename = 'note' + options.note
    this.message  = resolveMessage(options)
    this.source   = src
    this.id       = generate_id()
  }

  update (src) {
    if (src.command)
      this.source = src.command
    if (src.key)
      this.message.note = src.key
  }

  save (map) {
    map = map || this.host.mappings
    map.add(this)
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
    return fn(this)
  }

  @self
  async openScriptFile () {
    let dir = getDirectory()
    let path = resolve(dir.getPath(), this.filename)
    let editor = await atom.workspace.open(path)
    let subscriptions = new CompositeDisposable()
    let handleSave = () => this.save()
    let handleClose = () => subscriptions.dispose()
    subscriptions.add(
      editor.onDidSave(handleSave),
      editor.onDidDestroy(handleClose)
    )
  }

  @self
  toJSON () {
    return this.message.toJSON()
  }
}

const resolveMessage = (data) =>
  data instanceof MIDIMessage ?
    data : new MIDIMessage(data)

const generate_id = () =>
  '_' + parseInt(Math.random() * 1000000000).toString(25)
