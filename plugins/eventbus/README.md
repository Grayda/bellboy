# bellboy-eventbus
## Inter-plugin communication for [Bellboy](http://github.com/Grayda/bellboy)
This plugin is a wrapper for EventEmitter2, but with a few helper functions

## Usage
- Consume this plugin and call the `emit` function like you would when using EventEmitter
- To listen for events, use the `.on` function like you normally would
- Best practice is to prefix the plugin name. For example, emit `audio.playing` or `user.authenticated` for the audio and user plugins respectively
