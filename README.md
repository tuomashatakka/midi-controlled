# midi-controlled

A package for handling MIDI messages and interfaces in Atom.io –
Use your MIDI interface as an alternate macro keyboard to greatly
step up your work efficiency (and make your workspace stand out)!


## Features

- Javascript callback functions for MIDI messages events
- Mapping of callbacks by MIDI learn

This package implements an interface for writing callbacks for any
received MIDI events. Those functions are run in atom's context so
they may be used to configure the Atom's workspace in any way
possible (or what would be possible with for an atom package).

Currently callbacks are only available to noteon events, but this
will change in the future updates (hopefully :v).


### Coming Soon™
- Sending of MIDI messages to MIDI outputs


## Usage

Run `midi-controlled:add-handler` to open the callback editor which
allows you to write a callback for a MIDI noteon event.

Click save when finished to apply the callback.

The callback will be triggered as soon as a MIDI event
for the note the callback was applied to is received.

Alternatively you may run `midi-controlled:listen`. This activates
listening for MIDI events – as soon as one is received, the
callback editor for the received message will be opened.

All MIDI inputs are being listened as long as they are connected
to the computer. The callbacks are shared amongst the devices
so writing separate callbacks for different devices is not supported.

Callbacks are stored in atom's storage folder under the `midi` directory
and may be edited by hand any time. However, changes don't become
active until Atom has been restarted.
