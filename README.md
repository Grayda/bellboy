bellboy
=======

Bellboy is a node.js application that is designed to play an MP3 at specified times. It's purpose is to replace a tone generator and timer, allowing places like schools to automate the ringing of bells

Features
========

 - Can be used as a bell replacement for schools. Simply plug an Raspberry Pi into your PA and set your times.
 - Email support allows you to send an email for various events, including:
   - When the app crashes
   - When bells are enabled or disabled
   - When a bell is triggered
 - Cron-style syntax for setting up complex times
 - Designed to run on a Raspberry Pi
 - Has a web UI to allow enabling / disabling of bells
 - Uses `nodemon` to allow crash recovery, actions on crash, plus easy updating via `git pull`

Installation
============

This first version is designed to be installed on a Raspberry Pi v2. It'll work just fine on other Linux platforms where Node is available, but you'll need to do stuff manually.

To install:

 - Run `sudo wget -qO- https://raw.githubusercontent.com/Grayda/bellboy/beta/install.sh | bash`
 - Run `sudo reboot`
 - Go to http://[ip address of Pi]:8080 to confirm.

If you're installing this behind a self-signed certificate, you'll need to run `git config http.sslverify false` to allow `git` through, then `sudo npm config ssl-strict false` to allow `npm` through. You might have to add `--no-check-certificate` to any wget call. If you have to authenticate against a portal (as is the case at my workplace), you can enable X11 forwarding in your SSH client (e.g. PuTTY) and then open the `epiphany` browser in order to authenticate via a web browser, then use `apt-get install lynx` to install a text-based browser

Limitations
===========

 - This doesn't work on Windows. The line that `require`s the audio player causes the app to hang. It's a bug with Node on Windows (I believe), as other audio libraries do the same thing

To-Do / Wishlist
================

Here's a list of things I'd like to eventually add, plus some ideas to consider. If you have any more ideas, please open an issue and argue your case :)

  - [x] Add web UI to allow adjustment plus download / upload of times and settings
  - [ ] Security! Security! Security! Security! Security!
  - [ ] Make bells.json loadable from URL / file
  - [ ] Record & include some sample audio files
  - [x] Add file arrays to allow random songs to be picked and played
  - [x] Add logging
  - [ ] Add feature to allow physical push buttons for quick / emergency ringing
  - [x] Allow disabling of entire bell system (for holidays, student free days etc.)
    - [ ] Allow scheduling of disable / enable times?
  - [ ] Allow complex bells (e.g. bells disable other bells)
  - [ ] Allow addons?
  - [ ] Create a separate JS for the web stuff, or provide a REST API so you can write your own front-end?
  - [ ] Convert the UI into a RESTful service so people can write their own front-end
    - [ ] Perhaps investigate MQTT, as that would also allow subscriptions to bells by other systems
    - [ ] Perhaps break this all down into various services (e.g. base just triggers / emits events, and an audio "module" plays the sound)
