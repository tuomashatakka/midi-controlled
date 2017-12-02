const Entry = require('../models/MapEntry')
const { Emitter } = require('event-kit')

let signal = new Emitter()

class MapEntryElement extends HTMLElement {

  /* eslint-disable class-methods-use-this */
  get emitter () { return signal }
  getTitle () { return 'Lörssön löö' }
  dispatch () { return signal.emit.apply(signal, arguments) }
  listen () { return signal.on.apply(signal, arguments) }
  /* eslint-enable class-methods-use-this */

  connectedCallback () {
    let form         = document.createElement('form')
    let note         = document.createElement('atom-text-editor')
    let editor       = document.createElement('atom-text-editor')
    let header       = document.createElement('header')
    let footer       = document.createElement('footer')
    let saveButton   = document.createElement('button')
    let cancelButton = document.createElement('button')

    note.name              = 'key'
    editor.name            = 'content'
    header.innerHTML       = `<h3>MIDI Callback</h3>`
    saveButton.innerHTML   = `Apply`
    cancelButton.innerHTML = `Cancel`

    cancelButton.setAttribute('class', 'btn btn-error')
    saveButton.setAttribute('class', 'btn btn-success')
    footer.setAttribute('class', 'btn-toolbar')
    note.setAttribute('class', 'mini')
    note.setAttribute('mini', 'mini')

    footer.append(saveButton, cancelButton)
    form.append(note, editor)
    this.append(header, form, footer)
    this.setAttribute('class', 'padded pane-item')

    let close  = this.close.bind(this)
    let submit = this.submit.bind(this)
    saveButton.addEventListener('click', submit)
    cancelButton.addEventListener('click', close)

    setTimeout(() =>
    setGrammar(editor, 'js')
    , 1200)
  }

  submit () {
    this.dispatch('submit', this.toJSON())
    this.close()
    this.dispatch('did-submit', this.model)
  }

  close () {
    let pane = atom.workspace.getActivePane()
    if (!pane)
      return
    if (pane.getActiveItem() === this.model)
      pane.destroyActiveItem()
    this.dispatch('did-close')
  }

  getMessage () {
    return this.model.message
  }

  toJSON () {
    let elements = [ ...this.querySelectorAll('atom-text-editor') ]
    let data = {}
    for (let element of elements)
      data[element.name] = element.getModel().getText()
    return data
  }


  onSubmit (callback) {
    return this.listen('will-submit', callback)
  }

  onDidSubmit (callback) {
    return this.listen('did-submit', callback)
  }

  onDidClose (callback) {
    return this.listen('did-close', callback)
  }

  static provide (instance) {
    let editor      = document.createElement(MapEntryElement.tagName)
    editor.model    = instance
    // instance.editor = editor
    return editor
  }

  static get tagName () {
    return 'midi-editor-entry'
  }

  static registerElement () {
    return customElements.define(MapEntryElement.tagName, MapEntryElement)
  }

  static getElement () {
    return customElements.get(MapEntryElement.tagName)
  }

}

function getGrammar (scope) {
  return atom.grammars.grammarForScopeName('source.' + scope)
}

function setGrammar (element, scope) {
  let grammar = getGrammar(scope)
  let editorElement = findElement(element, 'atom-text-editor')
  let model = editorElement.getModel()
  model.setGrammar(grammar)
}

function findElement (root, tagName) {
  let children = [ ...root.children ]
  let tag = tagName.toUpperCase()
  if (root.tagName === tag)
    return root
  for (let child of children) {
    let recurse = findElement(child, tagName)
    if (recurse)
      return recurse
  }
  return null
}


module.exports = function registerView () {
  MapEntryElement.registerElement()
  let subscription = atom.views.addViewProvider(
    Entry,
    MapEntryElement.provide)
  console.log("subscription", subscription)
  return subscription
}
module.exports.view = MapEntryElement
