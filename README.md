# Bellboy
Bellboy is a node.js based system designed to replace automated (or manual) bells in schools and factories. It uses cron-like syntax to schedule bells and a plugin system to extend it's capabilities

## About this software
This software is still in alpha. It's been through three versions, and is expected to change frequently as it develops. Many plugins are incomplete or insecure. Use at your own risk

Plugins are written as C9 Architect plugins and use EventEmitter events to perform and report actions

## Installation
1. Run `npm install` in the root folder to set up everything. Ensure `gulp` is installed globally
2. Run `gulp install-plugins` to install all the necessary plugins
3. Download mpg123 from http://mpg123.de and extract the whole folder to `./plugins/audio/mpg123`. If you're on Linux, install mpg123 through your package manager
4. Put your audio in `./audio`
5. Edit `./schedules/bells.json` accordingly.
6. Run `nodemon index.js`

## What's left to do?
* Finish users plugin
* Finish REST plugin
* Plus tons of other stuff
