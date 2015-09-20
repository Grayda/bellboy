bellboy
=======

Bellboy is a node.js application that is designed to play an MP3 at specified times. It's purpose is to replace a tone generator and timer, allowing places like schools to automate the ringing of bells

Current Features
================

 - Can be used as a bell replacement for schools. Simply plug an Raspberry Pi into your PA and set your times.
 - Cron-style syntax for setting up complex times
 - Designed to run on a Raspberry Pi
 - Has a web UI to allow enabling / disabling of bells
 - Uses `nodemon` to allow crash recovery, actions on crash, plus easy updating via `git pull`

Installation
============

 - Clone somewhere
 - Install `libasound2-dev` via apt-get (or whatever package manager) if building on Linux
 - If using Windows, download cmdmp3 from https://lawlessguy.wordpress.com/2015/06/27/update-to-a-command-line-mp3-player-for-windows/ and put it in ./addons/bellaudio/
 - Install `nodemon` with: `npm install -g nodemon`
 - Run `npm install`
 - Edit `./config/bells.json` and `./config/config.json` accordingly
 - Run `nodemon index`

Limitations
===========

 - BellTFT hasn't been tested yet
 - The web stuff needs a lot more polish

What's new in this version?
===========================

Last updated 20/09/2015

 - socket.io stuff more reliable
   - The table on index.html now reloads automatically, either every 10 seconds or when a bell is triggered or updated
   - status.html page now rings bells without having to leave the page
   - Time and next bell continue to update, even if a new client connects to socket.io
 - New functions in core/index.js and some cleanup in /index.js
   - New functions mostly deal with adding and deleting bells
 - BellTFT renamed to BellPi, as it will now deal with other RPi stuff, like adjusting volume
 - Fixed a bug with node-cron where the bell would ring twice if job created at a certain time. See [this issue][1] for more info


To-Do / Wishlist
================

Here's a list of things I'd like to eventually add. If you have any more ideas, please open an issue and argue your case :)

- [ ] Better error handling
- [ ] More security! Need logins and such!
- [x] Dynamic reloading of the list of bells on the web UI
- [ ] Allow burst-bells (e.g. bell sound that loops once, but can loop for 5 seconds)
  - [ ] Allow tone-generated bells (e.g. play for x many seconds at y kHz)?
- [ ] Logging support
- [ ] Write an installer again
- [ ] Add the missing features on the sidebar
- [ ] Code tidy up. Get rid of some callback hell in the main index
- [ ] Allow multiple bell schedules
  - [ ] Allow trigger-based switching. This could allow stuff like switching from schedule 1 to schedule 2 when the "Last Friday of the month" bell goes off
- [ ] Perhaps some MQTT so it'll play nice with other systems?
- [ ] Allow setting of buttons on status page for RPi TFT screen (so button1 can be trigger, disable etc.)
  - [ ] Config page to pick a task and a bell to assign to?
- [ ] More virtual bells, for example, "\_alarm", "\_switch" (for changing schedules) and "\_default" to allow default bells?
- [ ] Add a page for "virtual" bells (like the "\_all" bell)

[1]: https://github.com/ncb000gt/node-cron/issues/180
