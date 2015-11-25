# Bellboy api

## Overview
Bellboy is a plugin-based node.js app that performs actions on a schedule. It's designed to replace a school bell timer system, but is flexible enough to be used in any scenario where you require actions to run.

The default setup loads "bells" from a JSON file and uses later.js to schedule them for execution. An event bus plugin alerts other plugins when the bell has been triggered so that they may perform other actions.

## About Plugins
Bellboy uses [C9's architect](http://github.com/c9/architect) at its core, so new plugins and actions can easily be added. Plugins should be written to be generic enough so functionality can be swapped out without affecting the rest of the plugins. If done correctly, it means you could effectively swap the file system-based `bells` plugin with a plugin that uses MongoDB, or the Emitter-based `eventbus` plugin for one that communicates via TCP to allow distributive bell triggering.

### Overriding Plugins
If you wish to override plugins, copy the plugin into the `thirdparty` folder and update the main `index.js` to point to the new location. This ensures easy enabling / disabling of plugins and that they're more likely to survive app updates

## About Bells

### About the bell "format"
Many of the plugins will accept or return a `bell` object. Depending on the function, it could be a group of bells, or a single bell. A group of bells typically looks like this:

    [{
      "ID": "firstbell",
      "Name": "First Bell",
      "Description": "First bell of the day. Rings at 9am",
      "Enabled": true,
      "Time": "0 9 * * 1-5",
      "Actions": {
        "SomePlugin": {
          "Value1": "Hello",
          "Value2": "World"
        }
      }
    },
    {
      "ID": "secondbell",
      "Name": "Second Bell",
      "Description": "Second bell of the day. Rings at 10am",
      "Enabled": true,
      "Time": "0 10 * * 1-5",
      "Actions": {
        "SomePlugin": {
          "Value1": "Hello",
          "Value2": "World"
        }
      }
    }]

The bare minimum needed to meet the "bell" requirement, is `ID`, `Name`, `Description`, `Enabled` and `Time`. **Everything else should be optional**

### About bell actions
Plugins can watch for `trigger` events via the `eventbus` plugin and perform actions around that. Actions should be set up in the `Actions` sub-object of a bell object (see `SomePlugin` in the example above) and should be optional.

For an example of a bell action, check out the `audio` plugin which both reacts to an event, and has an Action it responds to (`Action.Audio`)

### About Virtual Bells
"Virtual" bells are not typical bells. They're designed to perform a special / specific action. Virtual bell IDs begin with a `_`.

  - \_buttonX
    - Where `X` is a number (typically between 1-4). This virtual bell is designed to be used with the PiTFT screen or any other push button input and allows you to trigger a "generic" bell. These "buttons" appear on the status screen (if using the `web` plugin) so you can use them with a touch screen or the PiTFT
  - \_all
    - If \_all is disabled, no other bells should ring. There will eventually be a check in the `bells` plugin but for now plugins should honor this bell's enabled status
  - \_emergency
    - This bell is not implemented yet, but when it is, it'll be used to play an emergency tone (e.g. evacuation tone etc.). It can be used to send emails on evacuation tones and such.
