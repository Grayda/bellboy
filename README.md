bellboy
=======

Bellboy is a node.js application that is designed to play an MP3 at specified times. It's purpose is to replace a tone generator and timer, allowing places like schools to automate the ringing of bells

Features
========

 - Email support allows you to send an email when the timer goes off. Email also supports templates, so you can customize the body and subject
 - Cron-style syntax for setting up complex times
 - Designed to run on a Raspberry Pi

Installation
============

 - Clone somewhere
 - Install `libasound2-dev` via apt-get (or whatever package manager) if building on Linux
 - Install Visual Studio if building on Windows (you need to customize the installer and ensure C++ is installed as a programming language, otherwise you'll get CL.exe errors)
 - Run `npm install`
 - Edit `bells.json` and `config.json` accordingly
 - Run `node index`

Limitations
===========

 - This doesn't work on Windows. The line that `require`s the audio player causes the app to hang. It's a bug with Node on Windows (I believe), as other audio libraries do the same thing

To-Do
=====

  - [ ] Add web UI to allow setting of times
  - [ ] Make bells.json reloadable
  - [ ] MOAR OPTIONS!
  - [ ] Record & include some sample audio files
