# Bellboy api

<!-- TOC depth:6 withLinks:1 updateOnSave:1 orderedList:0 -->

- [Bellboy api](#bellboy-api)
	- [Overview](#overview)
	- [About Plugins](#about-plugins)
		- [Overriding Plugins](#overriding-plugins)
	- [About Bells](#about-bells)
		- [About the bell "format"](#about-the-bell-format)
		- [About bell actions](#about-bell-actions)
		- [About Virtual Bells](#about-virtual-bells)
	- [Plugins](#plugins)
		- [`audio`](#audio)
			- [Consumes](#consumes)
			- [Options](#options)
				- [`audioPath` _(required)_](#audiopath-required)
			- [Variables](#variables)
			- [Functions](#functions)
				- [`play` _(bell)_](#play-bell)
			- [Events](#events)
				- [Listeners](#listeners)
					- [`trigger` _(bell)_](#trigger-bell)
				- [Emitters](#emitters)
					- [`audio_started` _(file)_](#audiostarted-file)
					- [`audio_finished` _(file)_](#audiofinished-file)
		- [`bells`](#bells)
			- [Consumes](#consumes)
			- [Options](#options)
				- [`root` _[optional]_](#root-optional)
				- [`bellFile` _(required)_](#bellfile-required)
			- [Variables](#variables)
				- [`bells`](#bells)
			- [Functions](#functions)
				- [`loadBells`](#loadbells)
				- [`saveBells`](#savebells)
				- [`toArray` _[omitVirtual]_](#toarray-omitvirtual)
				- [`get` _(id)_](#get-id)
				- [`set` _(id, property, value)_](#set-id-property-value)
				- [`delete` _(id)_](#delete-id)
			- [Events](#events)
				- [Listeners](#listeners)
					- [`trigger` _(bell)_](#trigger-bell)
				- [Emitters](#emitters)
					- [`bells_bellsloaded`](#bellsbellsloaded)
					- [`bells_bellloaded` _(bell)_](#bellsbellloaded-bell)
		- [`config`](#config)
			- [Consumes](#consumes)
			- [Options](#options)
			- [Variables](#variables)
			- [Functions](#functions)
			- [Events](#events)
				- [Listeners](#listeners)
				- [Emitters](#emitters)
		- [`eventbus`](#eventbus)
			- [Consumes](#consumes)
			- [Options](#options)
			- [Variables](#variables)
				- [`emitter`](#emitter)
			- [Functions](#functions)
				- [`emit` _[arg1, arg2, ...]_](#emit-arg1-arg2-)
				- [`on` _[arg1, arg2, ...]_](#on-arg1-arg2-)
				- [`error` _(error, module)_](#error-error-module)
			- [Events](#events)
				- [Listeners](#listeners)
				- [Emitters](#emitters)
		- [`logger`](#logger)
			- [Consumes](#consumes)
			- [Options](#options)
			- [Variables](#variables)
			- [Functions](#functions)
				- [`log` _[text, level]_](#log-text-level)
			- [Events](#events)
				- [Listeners](#listeners)
				- [Emitters](#emitters)
		- [`scheduler`](#scheduler)
			- [Consumes](#consumes)
			- [Options](#options)
			- [Variables](#variables)
				- [`schedules`](#schedules)
				- [`jobs`](#jobs)
				- [`lastJob`](#lastjob)
			- [Functions](#functions)
				- [`scheduleBells` _(bells)_](#schedulebells-bells)
				- [`next` _[bell, amount]_](#next-bell-amount)
				- [`previous` _[bell, amount]_](#previous-bell-amount)
				- [`toString` _(bell)_](#tostring-bell)
				- [`toNow` _(bell)_](#tonow-bell)
				- [`toInt` _(bell)_](#toint-bell)
			- [Events](#events)
				- [Listeners](#listeners)
				- [Emitters](#emitters)
					- [`trigger` _(bell)_](#trigger-bell)
					- [`disabledtrigger` _(bell)_](#disabledtrigger-bell)
		- [`validate`](#validate)
			- [Consumes](#consumes)
			- [Options](#options)
			- [Variables](#variables)
			- [Functions](#functions)
				- [`isFilename` _(str)_](#isfilename-str)
			- [Events](#events)
				- [Listeners](#listeners)
				- [Emitters](#emitters)
		- [`web`](#web)
			- [Consumes](#consumes)
			- [Options](#options)
				- [`port` _(required)_](#port-required)
			- [Variables](#variables)
				- [`io`](#io)
			- [Functions](#functions)
			- [Events](#events)
				- [Listeners](#listeners)
					- [`trigger` _(bell)_](#trigger-bell)
				- [Emitters](#emitters)
			- [Endpoints](#endpoints)
				- [`/api/bells` (GET, json)](#apibells-get-json)
				- [`/api/bells/get/<bell>` (GET, json)](#apibellsgetbell-get-json)
				- [`/api/bells/next` (GET, json)](#apibellsnext-get-json)
				- [`/api/bells/next/<bell>` (GET, string)](#apibellsnextbell-get-string)
				- [`/api/bells/next/<bell>/date` (GET, string)](#apibellsnextbelldate-get-string)
				- [`/api/bells/next/<bell>/<amount>` (GET, json)](#apibellsnextbellamount-get-json)
				- [`/api/bells/previous/<bell>` (GET, string)](#apibellspreviousbell-get-string)
				- [`/api/bells/previous/<bell>/<amount>` (GET, json)](#apibellspreviousbellamount-get-json)
		- [`Plugin`](#plugin)
			- [Consumes](#consumes)
			- [Options](#options)
				- [`option` _(required)_](#option-required)
			- [Variables](#variables)
				- [`variable` _(required)_ _[optional]_](#variable-required-optional)
			- [Functions](#functions)
				- [`Function` _(required)_ _[optional]_](#function-required-optional)
			- [Events](#events)
				- [Listeners](#listeners)
					- [`listener` _(required)_ _[optional]_](#listener-required-optional)
				- [Emitters](#emitters)
					- [`emitter` _(required)_ _[optional]_](#emitter-required-optional)
<!-- /TOC -->

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

For a practical example of a bell action, check out the `audio` plugin which both reacts to an event, and has an Action it responds to (`Action.Audio`)

### About Virtual Bells
"Virtual" bells are not typical bells. They're designed to perform a special / specific action. Virtual bell IDs begin with a `_`. Below is a list of virtual bells:

  - `_buttonX`
    - Where `X` is a number (typically between 1-4). This virtual bell is designed to be used with the PiTFT screen or any other push button / touch / mouse input and allows you to trigger a "generic" bell. These "buttons" appear on the status screen (if using the `web` plugin) so you can use them with a touch screen or the PiTFT. As they're pretty close to regular bells, they can play audio, send emails, toggle or trigger other bells and so forth.
  - `_all`
    - If \_all is disabled, no other bells should ring. There will eventually be a check in the `bells` plugin but for now plugins should honor this bell's enabled status
  - `_emergency`
    - This bell is **not implemented** yet, but when it is, it'll be used to play an emergency tone (e.g. evacuation tone etc.). It can be used to send emails on evacuation tones and such.

## Plugins
The following plugins, variables, events and functions may change as development continues. Please check the associated plugin before calling any functions from there

### `audio`
Audio plugin. Lets you play MP3s
NOTE: This plugin uses `mpg123` which can be downloaded from [the mpg123 website](http://www.mpg123.de/download/). If running on Linux, use `sudo apt-get install mpg123`

#### Consumes
  - `eventbus`
	- `validate`
	- `logger`

#### Options
##### `audioPath` _(required)_
The location of MP3 files to play. Usually `__dirname/audio`

#### Variables
None

#### Functions
##### `play` _(bell)_
Plays an audio file, given a `bell`. This function looks in `Actions.Audio.File` for an array of files. It then shuffles the array, picks the first item, and runs `mpg123` to play the audio.

If `Actions.Audio.Loop` is a number, the audio will loop that many times, otherwise it'll only play once.  

#### Events
##### Listeners
###### `trigger` _(bell)_
Waits for a bell, then calls `audio.play(bell)`

##### Emitters
###### `audio_started` _(file)_
Indicates that `file` has started playing.

###### `audio_finished` _(file)_
Indicates that `file` has finished playing completely

### `bells`

#### Consumes
- `eventbus`
- `validate`
- `logger`

#### Options
##### `root` _[optional]_
Should point to the root folder (i.e. where the main index.js lives). Normally defaults to `__dirname`

##### `bellFile` _(required)_
The .json file that contains the bells we wish to load

#### Variables
##### `bells`
Contains all of the currently loaded bells in the format mentioned above

#### Functions
##### `loadBells`
Loads the bells from `options.bellFile` into the `bells` variable

##### `saveBells`
This function isn't active yet, but when it is, will save the bells into `options.bellFile`

##### `toArray` _[omitVirtual]_
Returns `bells` in an array which is used by the `web` plugin. This feature might be deprecated soon enough

##### `get` _(id)_
Retrieves a bell, given an `id`. Uses lodash's `where` function

##### `set` _(id, property, value)_
Sets the `property` of a bell to `value`, given the `id` of the bell.

##### `delete` _(id)_
Not yet implemented. Deletes a bell given an `id`


#### Events
##### Listeners
###### `trigger` _(bell)_
When a bell is triggered, this plugin looks for an array of objects in `Actions.ToggleBells`. It then loops through the array and toggles each bell accordingly. Array of objects is expected to be in this format:

- `[{ "ID": "firstbell", "Enabled": false }, { "ID": "secondbell", "Enabled": true }]`


##### Emitters
###### `bells_bellsloaded`
Emitted when all the bells have been loaded

###### `bells_bellloaded` _(bell)_
Emitted when a single bell is loaded. `bell` is a bell in the standard bell format, as described earlier in this document

### `config`
This plugin isn't currently used.

#### Consumes
None

#### Options
None

#### Variables
None

#### Functions
None

#### Events
##### Listeners
None

##### Emitters
None


### `eventbus`
Central event bus for inter-plugin communication. Uses node.js's EventEmitter for communication

#### Consumes
None

#### Options
None

#### Variables
##### `emitter`
Alias for EventEmitter

#### Functions
##### `emit` _[arg1, arg2, ...]_
Alias of EventEmitter.emit()

##### `on` _[arg1, arg2, ...]_
Alias of EventEmitter.on()

##### `error` _(error, module)_
The same as calling `eventbus.emit('error', error, module)`

#### Events
##### Listeners
None

##### Emitters
None


### `logger`
Simple wrapper for console.log that will be expanded to log to file and / or other services

#### Consumes
  - `validate`

#### Options
None

#### Variables
None

#### Functions
##### `log` _[text, level]_
Outputs `text` to the screen IF `process.env.DEBUG` is greater than `level` (to allow various logging levels). If `level` is not set or is not an integer, `level` is set to `0`

#### Events
##### Listeners
None

##### Emitters
None

### `scheduler`
A plugin that schedules bell times for execution. Uses later.js

#### Consumes
  - `eventbus`
  - `logger`  
  - `bells`  
  - `validate`  

#### Options
None

#### Variables
##### `schedules`
A list of later.js schedules. A schedule is created when `later` parses our `Time` cron expression from the bell

##### `jobs`
A list of later.js jobs that are executed.

##### `lastJob`
An array containing the last jobs to execute, newest first:

`[{ "name": "secondbell", "date": "2015-11-26T05:07:00.250Z" }, { "name": "firstbell", "date": "2015-11-26T05:06:00.250Z" }]`

Note: This variable is likely to change. Please consult this document again when you wish to query the last jobs

#### Functions
##### `scheduleBells` _(bells)_
Takes all the bells and one by one, sets up a `later.setInterval` based on the `Time` cron expression and executes the job at the specified time. Emits the `trigger` event

##### `next` _[bell, amount]_
Works out the next occurrence of a bell. If `bell` is not given, this function will look at all bells (except where `bell.Enabled` is `false`) and return an array of objects, showing the next occurrence of all bells, newest first:

`[{ "id": "firstbell", "date": "2015-11-26T05:06:00.250Z" }, { "id": "secondbell", "date": "2015-11-26T05:07:00.250Z" }]`

If `bell` is specified, the next occurrence of that particular bell will be returned, even if `Enabled` is `false`:

`"2015-11-26T05:06:00.250Z"`

If `amount` is an integer, returns an array containing the next `amount` worth of bells:

`["2015-11-26T05:09:00.026Z","2015-11-26T05:10:00.026Z","2015-11-26T05:11:00.026Z"]`

##### `previous` _[bell, amount]_
Identical to `next`, but gets the previous bell(s). NOTE: This is the the last bell _chronologically_, NOT the last bell that actually rang. To get that, see `lastJob`

##### `toString` _(bell)_
Calls `next(bell)` and uses `moment.js` to format the date. Format will eventually be pulled from the config, but for now, it's hard-coded as "D MMMM YYYY, hh:mm:ssa"

##### `toNow` _(bell)_
Returns a human readable representation of `next(bell)`. For example _"in 3 hours"_

##### `toInt` _(bell)_
Gets the difference between the current time and `next(bell)` in milliseconds. Useful for more specific calculations

#### Events
##### Listeners
None

##### Emitters
###### `trigger` _(bell)_
Emitted when a bell is triggered (that is, when `later.setInterval` executes). This event is used by a wide range of plugins to react to a triggered bell. `bell` is the usual bell format, as described at the start of the document.

###### `disabledtrigger` _(bell)_
Emitted when a bell is triggered, but is disabled. Useful for performing calculations on upcoming bells. `bell` is the same as above

### `validate`
A plugin to handle validation of data. This is basically a wrapper for the `validator` npm module

#### Consumes
None

#### Options
None

#### Variables
See [validator](https://www.npmjs.org/package/validator) for all variables


#### Functions
See [validator](https://www.npmjs.org/package/validator) for all valid functions

##### `isFilename` _(str)_
Determines if `str`is a valid filename. A valid filename is one that doesn't include any items on [this Wikipedia list](https://en.wikipedia.org/wiki/Filename#Reserved_characters_and_words)

#### Events
##### Listeners
None

##### Emitters
None

### `web`
A web front-end for managing and viewing bells. Uses a combination of express, bower, bootstrap, socket.io and angular to make managing bells easy.

#### Consumes
  - `bells`
	- `scheduler`
	- `logger`
	- `eventbus`

#### Options
##### `port` _(required)_
What port the web UI should be available from.

#### Variables
##### `io`
Alias for a socket.io object

#### Functions
None

#### Events
##### Listeners
###### `trigger` _(bell)_
When a bell is triggered

##### Emitters
None

#### Endpoints
The `web` plugin also exposes a REST API which allows you to get and set bells.

##### `/api/bells` (GET, json)
Returns a JSON string containing an array of bells

##### `/api/bells/get/<bell>` (GET, json)
Returns a JSON string containing _`<bell>`_

##### `/api/bells/next` (GET, json)
Returns a JSON string containing all bells in chronological order (soonest first)

##### `/api/bells/next/<bell>` (GET, string)
Returns a date string with the next occurrence of _`<bell>`_

##### `/api/bells/next/<bell>/date` (GET, string)
Returns a formatted date string with the next occurrence of _`<bell>`_

##### `/api/bells/next/<bell>/<amount>` (GET, json)
Returns a JSON string array containing the next _`<amount>`_ occurrences for _`<bell>`_

##### `/api/bells/previous/<bell>` (GET, string)
Returns a date string with the previous occurrence of _`<bell>`_

##### `/api/bells/previous/<bell>/<amount>` (GET, json)
Returns a JSON string array containing the previous _`<amount>`_ occurrences for _`<bell>`_

##### `/api/bells/toggle/<bell>` (POST, string)
Returns new state. If _`<bell>`_ is true, changes it to false, and vice versa.

##### `/api/bells/toggle/<bell>/<state>` (POST, string)
Returns new state. Sets _`<bell>`_ to _`<state>`_


----------------------------------------

### `Plugin`
Description of the plugin

#### Consumes
  - `plugin`

#### Options
##### `option` _(required)_
Description

#### Variables
##### `variable` _(required)_ _[optional]_
Description of variable

#### Functions
##### `Function` _(required)_ _[optional]_

#### Events
##### Listeners
###### `listener` _(required)_ _[optional]_
Description

##### Emitters
###### `emitter` _(required)_ _[optional]_
Description
