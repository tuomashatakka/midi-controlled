'use babel'

import { extname } from 'path'
import { Directory } from 'atom'
import { existsSync, unlinkSync } from 'fs'

const scriptDirName   = 'midi'

const registeredCommandRegex = /\s*(('|")?([\w-:]+)('|")?)\s*/

function bootstrapScript (src) {
  return `'use babel'
export default function () {
(function (atom) {
${src};
})(atom)}`
}

export const getDirectory = () =>
  new Directory(atom.getStorageFolder().pathForKey(scriptDirName))


async function getFile (name) {

  let folder = getDirectory()
  await folder.create()

  if (!name) name = 'index.js'
  else if (!extname(name)) name = name + '.js'

  let file = folder.getFile(name)
  if (!file.existsSync())
    await file.create()
  return file
}

function clearScripts () {
  let directory = getDirectory()
  let entries = directory.getEntriesSync()
  for (let entry of entries)
    removeScript(entry)
  try {
    if (directory.getEntriesSync().length === 0)
      unlinkSync(directory.getPath())
  }
  catch (e) { /**/ }
}

function removeScript (entry) {
  if (typeof entry !== 'string')
    if (entry.existsSync && entry.existsSync())
      unlinkSync(entry.getPath())
  else
    if (existsSync(entry))
      unlinkSync(entry)
}

async function writeToFile (name, src='') {
  let file = await getFile(name)
  let path = file.getPath()
  removeScript(path)
  await file.write(bootstrapScript(src))
  return (...args) => require(path)(...args)
}

export async function composeCallback (entry) {

  let name = entry.filename
  let src  = entry.source

  if (!src)
    return () => alert("No callback in", entry.key)

  let hasLinebreaks = src.search(/\n/) > -1
  let wellFormed    = src.match(registeredCommandRegex)
  let formatPass    = wellFormed && wellFormed[0].length === src.trim().length
  let isCommand     = formatPass && !hasLinebreaks && atom.commands.registeredCommands[src]

  let dispatch = await writeToFile(name, src)

  return function () {

    // Primarily resolve as an atom command
    let view = atom.views.getView(atom.workspace.getActivePaneItem())
    if (isCommand)
      return atom.commands.dispatch( view, src )

    // Evaluate the script as-is as a last resort
    if (dispatch)
      try {
        let result = dispatch( atom, entry, view )
        console.warn("Resulted:", result)
        return result
      }
      catch (message) {
        error(entry, message)
      }
    return null
  }
}

function error (item, err) {
  let description = err.message

  atom.notifications.addWarning(
    `Could not run the callback function for ${item.key}`,
    { description,
      buttons: [{
        text: 'Edit function',
        onDidClick: item.openScriptFile
      }]
    })
}

export default function setupScripts (commands={}) {
  if (commands === 'clear')
    return clearScripts()
  let entries = Object
    .keys(commands)
    .reduce((acc, name) => ({ ...acc,
    [name]: composeCallback(commands[name], name) }), {})
  console.log("entries", entries)
  return entries
}
