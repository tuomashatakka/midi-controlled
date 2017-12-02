'use babel'
import { MessageContentEnum } from '../definitions'


export default class MIDIMessage {

  static from (raw) {
    if (raw instanceof MIDIMessage)
      return raw
    let data = parseMessage(raw)
    return new MIDIMessage(data)
  }

  constructor (data) {
    this.type     = parseInt(data.type)
    this.note     = parseInt(data.note)
    this.channel  = parseInt(data.channel)
    this.velocity = parseInt(data.velocity)
  }

  toJSON () {
    return {
      type:     this.type,
      note:     this.note,
      channel:  this.channel,
      velocity: this.velocity,
    }
  }
}


const parseMessage = ({ data }) =>
  MessageContentEnum.reduce((o, attr, n) =>
    Object.assign(o, { [attr]: data[n] }), {})

export const decode = d =>
  (parseInt(d) < 16 ? '0' : '') + d.toString(16)
