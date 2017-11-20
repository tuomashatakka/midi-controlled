'use babel'

import self from 'autobind-decorator'

import { info } from './print'
import MIDIHandler from './models/MIDIHandler'
import Entry from './models/MapEntry'

export default class MIDIService {

  constructor () {

    const applyHandler = handler => {
      this.handler = handler
    }
    this.start()
      .then(applyHandler)
      .catch(error => atom.notifications.addError(error.message))
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
    return await applyMIDIEventListeners()
  }

  @self
  stop () {
    info('Stopping the MIDI listener service')
    this.dispose()
  }

  @self
  dispose () {
    this.handler.dispose()
  }

  @self
  async defineHandler () {
    let entry  = new Entry({ note: null })
    let editor = await atom.workspace.open(entry)
    let view   = atom.views.getView(entry)
    let listen = new Promise(resolve => {
      console.log(editor, entry, view)
      view.onDidSubmit(resolve)
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
  // if (atom.devMode)
    window.midihandler = handler
  info(`Created a new MIDI handler`, handler)
  atom.notifications.addSuccess('Instatiated the MIDI event handler')
  console.info('MIDI HANDLER:', handler)
  return handler
}
