'use babel'

import self from 'autobind-decorator'

import { info } from './print'
import MIDIMessage from './models/MIDIMessage'
import MIDIHandler from './models/MIDIHandler'
import Entry from './models/MapEntry'

export default class MIDIService {

  constructor () {
    this.start()
  }

  @self
  async restart () {
    console.info("Restarting the midi process,", this)
    this.stop()
    return await this.start()
  }

  @self
  async start () {
    info('Starting the MIDI listener service')
    if (this.handler && !this.handler.disposed)
      throw new Error(`Cannot start a new midi service until the old one has been shut down.`)

    try {
      this.handler = await applyMIDIEventListeners()
    }
    catch (error) {
      atom.notifications.addError(error.message)
      console.warn(error)
    }

    if (atom.devMode)
      window.midiService = this
    return this.handler
  }

  @self
  stop () {
    info('Stopping the MIDI listener service')
    this.handler.dispose()
  }

  @self
  dispose () {
    this.stop()
  }

  @self
  toggleMIDILearn () {
    if (this.handler.learnActive)
      this.handler.disableLearn()
    else
      this.handler.enableLearn(this.defineHandler)
  }

  @self
  async defineHandler (message = { note: null }) {
    let entry = new Entry(message)
    await atom.workspace.open(entry)
    let view = atom.views.getView(entry)
    let handleSubmit = (data) => {
      entry.update(data)
      entry.save(this.handler.mappings)
      subscription.dispose()
    }
    let subscription = view.onSubmit(handleSubmit)
  }

  emitMessage (data) {
    if (!this.handler || this.handler.disposed)
      throw new ReferenceError(`Cannot emit a MIDI message without an active handler instance`)

    let message = new MIDIMessage(data)
    this.handler.dispatch(null, message)
    return message
  }

  clearHandlers () {
    this.handler.mappings.clear()
    this.handler.mappings.save()
  }
}

let _midi
async function applyMIDIEventListeners () {
  let midi = _midi || (_midi = await navigator.requestMIDIAccess())
  let handler = new MIDIHandler(midi)
  info(`Created a new MIDI handler`, handler)
  atom.notifications.addSuccess('Instatiated the MIDI event handler')
  info('MIDI HANDLER:', handler)
  return handler
}
