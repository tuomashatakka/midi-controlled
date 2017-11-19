'use babel'

import { info } from './print'
import MIDIHandler from './models/MIDIHandler'
import Entry from './models/MapEntry'

export default class MIDIService {

  constructor () {
    this
      .start()
      .then(handler => this.handler = handler)
  }

  async restart () {
    this.stop()
    this.handler = await this.start()
    info("Restarted the midi process,", this)
  }

  async start () {
    info('Starting the MIDI listener service')
    if (this.handler && !this.handler.disposed)
      throw new Error(`Cannot start a new midi service until the old one has been shut down.`)
    return await applyMIDIEventListeners()
  }

  stop () {
    info('Stopping the MIDI listener service')
    this.dispose()
  }

  dispose () {
    this.handler.dispose()
  }

  async defineHandler () {
    let entry  = new Entry({ note: null })
    let editor = await atom.workspace.open(entry)
    let view   = atom.views.getView(entry)
    let listen = new Promise(resolve => {
      console.log(editor, entry, view)
      const apply = (data) => {
        console.log(data)
        let key = data.note
        let content = data.callback
        resolve({ key, content })
      }
      view.onDidSubmit(apply)
    })

    console.warn("Handler definition declared", await listen)
    let { key, content } = await listen
    this.handler.mappings.add(key, content)
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
  if (atom.devMode)
    window.midihandler = handler
  info(`Created a new MIDI handler`, handler)
  return handler
}
