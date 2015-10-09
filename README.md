bellboy
=======

Bellboy is a node.js application that is designed to play an MP3 at specified times. It's purpose is to replace a tone generator and timer, allowing places like schools to automate the ringing of bells

Current Features
================

 - Can be used as a bell replacement for schools. Simply plug an Raspberry Pi into your PA system and set your times.
 - Cron-style syntax for setting up complex times
 - Designed to run on a Raspberry Pi
 - Has a web UI to allow enabling / disabling of bells
 - Uses `nodemon` to allow crash recovery, actions on crash, plus easy updating via `git pull`
 - (untested) Compatible with the Adafruit 2.2" PiTFT screen, allowing you to display bell info and trigger schedules
 - (untested) Can work with your existing relay system / tone generator. Pick a pin on your Pi, set it in config.json, then wire that pin to your system (extra hardware may be required) and you're set!

Installation
============

 - Clone somewhere
 - If using Windows, download mpg123 from http://www.mpg123.de/download/ and put it in ./addons/bellaudio/mpg123/
 - Install `nodemon` with: `npm install -g nodemon`
 - Run `npm install`
 - Edit `./config/bells.json` and `./config/config.json` accordingly
 - Run `nodemon index`

Limitations
===========

 - BellPi hasn't been tested yet
 - The web stuff needs a lot more security
 - Very stable, as long as you don't touch the web UI stuff, which is still in heavy development

To-Do / Wishlist / Notepad
==========================

Here's a list of things I'm thinking over, or I'd like to add, or that need to be done. If you have an idea, open an issue and argue your case! Some of these ideas may never make it in, but they're here so I don't forget, and can work out the finer details to see if they'd be worthwhile to implement.

 - [ ] Better error handling. Also stop dud data from crashing the unit (e.g. someone types in invalid cron syntax)
 - [x] More security! Need logins and such!
   - [ ] Secure status.ejs and make bcrypt asynchronous
 - [x] Dynamic reloading of the list of bells on the web UI
 - [x] Allow burst-bells (e.g. bell sound that loops once, but can loop for 5 seconds)
   - [ ] Allow tone-generated bells (e.g. play for x many seconds at y kHz)?
 - [x] Logging support
 - [x] Write an installer again
 - [ ] Add the missing features on the sidebar
 - [ ] Code tidy up. Get rid of some callback hell in the main index
 - [x] Allow multiple bell schedules
   - [x] Allow trigger-based switching. This could allow stuff like switching from schedule 1 to schedule 2 when the "Last Friday of the month" bell goes off
 - [ ] Perhaps some MQTT so it'll play nice with other systems?
 - [x] Allow setting of buttons on status page for RPi TFT screen (so button1 can be trigger, disable etc.)
  - [ ] Config page to pick a task and a bell to assign to?
 - ~~[ ] More virtual bells, for example, "\_alarm", "\_switch" (for changing schedules) and "\_default" to allow default bells?~~
  - [ ] Add a page for "virtual" bells (like the "\_all" bell)
 - [x] Include default bell & config, overwritable by another file (so I can .gitignore personal settings and still push changes to bells.json and config.json)
 - [x] Include better update mechanism. nodemon is too eager to restart when a single file changes
 - [ ] Allow user to set when "\_all" is enabled again? (e.g. disable permanently, disabled for 1 day, 1 week etc.)
 - [ ] Possibly investigate multi-zone ringing using multiple RPis?
   - [ ] Use UDP and good security to allow separate instances of Bellboy to talk
   - [ ] Good for smaller sites (e.g. secondary or tertiary sites that are used for special events and as such, don't require a screen
   - [ ] Determine use case for this
 - [ ] Documentation. Simple help, but also detailed building / setup / best practices guide.
 - [ ] Investigate loading of bells from non-cron sources (e.g. a public calendar in Google Calendar / Outlook)
   - [ ] Separate json loading from the core.
   - [ ] Move "\_default" bell to another spot? Still require a bells.json?
 - [ ] Investigate better loading and handling of modules, as bellboy.modules["bellmodule"].x() is not ideal
   - [ ] ExpressJS's "use" as an example? All grouped under the "app" variable, I think
