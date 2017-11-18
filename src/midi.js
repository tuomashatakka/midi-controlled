'use babel'

import MIDIHandler from './models/MIDIHandler'
import { info } from './print'

export default async function applyMIDIEventListeners () {
  let midi = await navigator.requestMIDIAccess()
  let handler = new MIDIHandler(midi)
  window.midihandler = handler
  info(`Created a new MIDI handler`, handler)
  return handler
}
