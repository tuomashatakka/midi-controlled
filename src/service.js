'use babel'

import { info } from './print'
import MIDIHandler from './models/MIDIHandler'

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
    let editor = await atom.workspace.open()
    let listen = new Promise(resolve => {
      const apply = () => {
        let key = editor.lineTextForBufferRow(0)
        let content = editor.getText().replace(/^.*?\n/, '')
        once.dispose()
        resolve({ key, content })
      }
      let once = atom.workspace.onWillDestroyPaneItem(apply)
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
