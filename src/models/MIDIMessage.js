'use babel'
import { type, MessageContentEnum } from '../definitions'


export default class MIDIMessage {

  static from (raw) {
    let data = parseMessage(raw)
    return new MIDIMessage(data)
  }

  constructor (data) {
    this.type = null
    this.note = null
    this.channel = null
    this.velocity = null
    Object.assign(this, data)
  }

  toJSON () {
    return {
      type: this.type,
      note: this.note,
      velocity: this.velocity,
      channel: this.channel,
    }
  }
}


const parseMessage = ({ data }) =>
  MessageContentEnum.reduce((o, attr, n) =>
    Object.assign(o, { [attr]: data[n] }), {})

export const decode = d =>
  (parseInt(d) < 16 ? '0' : '') + d.toString(16)
