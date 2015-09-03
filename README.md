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

 - Clone somewhere
 - Install `libasound2-dev` via apt-get (or whatever package manager) if building on Linux
 - Install Visual Studio if building on Windows (you need to customize the installer and ensure C++ is installed as a programming language, otherwise you'll get CL.exe errors)
 - Install `nodemon` with: `npm install -g nodemon`
 - Run `npm install`
 - Edit `bells.json` and `config.json` accordingly
 - Run `node index`

Limitations
===========

 - This doesn't work on Windows. The line that `require`s the audio player causes the app to hang. It's a bug with Node on Windows (I believe), as other audio libraries do the same thing

To-Do / Wishlist
================

Here's a list of things I'd like to eventually add. If you have any more ideas, please open an issue and argue your case :)

  - [ ] Add web UI to allow adjustment plus download / upload of times and settings
  - [ ] Security! Security! Security! Security! Security! 
  - [ ] Make bells.json loadable from URL / file
  - [ ] Record & include some sample audio files
  - [ ] Add file arrays to allow random songs to be picked and played
  - [ ] Add logging
  - [ ] Add feature to allow physical push buttons for quick / emergency ringing
  - [ ] Allow disabling of entire bell system (for holidays, student free days etc.)
    - [ ] Allow scheduling of disable / enable times?
  - [ ] Allow complex bells (e.g. bells disable other bells)
  - [ ] Allow addons?
  - [ ] Create a separate JS for the web stuff, or provide a simple set of PHP scripts?
