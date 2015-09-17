bellboy
=======

Bellboy is a node.js application that is designed to play an MP3 at specified times. It's purpose is to replace a tone generator and timer, allowing places like schools to automate the ringing of bells

Features
========

 - Accepts cron expressions to allow complex scheduling of times
 - Web UI to monitor and enable / disable bells
 - Built-in support for the Adafruit 2.2" TFT screen. Control the backlight and press the four buttons to make magic happen! Also includes a status page for at-a-glance info
 - Email support, so you can send out email alerts when bells are triggered or enabled / disabled
 - `nodemon` ready, allowing for quick updates and emails on app crashes
 - Windows, Mac and Linux support


Installation
============

This first version is designed to be installed on a Raspberry Pi v2. It'll work just fine on other Linux platforms where Node is available, but you'll need to do stuff manually.

To install:

 - SSH into your RPi and clone this repo using `git clone http://github.com/Grayda/bellboy`
 - Run `npm install -g nodemon` to install nodemon
 - Run `npm install` to install everything else
 - Run `nodemon index.js` to begin
 - Go to http://[ip address of Pi]:8080 to see the UI

 If you're running this on Windows, download cmdmp3 from https://lawlessguy.wordpress.com/2015/06/27/update-to-a-command-line-mp3-player-for-windows/ and place it in the `addons/bellaudio` folder

Future versions will include an installer so you can quickly prepare a Pi for use

Limitations
===========

 - Most of the options on the left side don't work yet. They will be enabled in future versions

To-Do / Wishlist
================

Here's a list of things I'd like to eventually add, plus some ideas to consider. If you have any more ideas, please open an issue and argue your case :)

  - [ ] Better error handling
  - [ ] More security! Need logins and such!
  - [ ] Dynamic reloading of the list of bells on the web UI
  - [ ] Logging support
  - [ ] Write an installer again
  - [ ] Add the missing features on the sidebar
  - [ ] Code tidy up. Get rid of some callback hell in the main index
  - [ ] Allow multiple bell schedules
    - [ ] Allow trigger-based switching. This could allow stuff like switching from schedule 1 to schedule 2 when the "Last Friday of the month" bell goes off
  - [ ] Perhaps some MQTT so it'll play nice with other systems?

Helping Out
===========

Like always, pull requests and additions welcome (especially new modules!). PayPal donations are also welcome via the email address on my GitHub profile. Money received will go towards things like more Raspberry Pi's, TFT screens and so forth which can be donated to schools to replace aging bell systems.
