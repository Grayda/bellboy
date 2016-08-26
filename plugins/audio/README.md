# bellboy-audio
## An audio player plugin for [Bellboy](http://github.com/Grayda/bellboy)
This plugin can play audio whenever a bell is triggered.

## Usage
- Clone into your `plugins` directory.
- Go back to the root folder and run `gulp install-plugins`
- Edit `plugins/plugins.json` and modify the defaults if necessary
- Install mpg123. On Linux, use your favourite package manager. On Windows, download [mpg123](http://mpg123.de) and extract all the files to the `plugins/audio/mpg123` folder.
- Copy your bell sound(s) into ./audio
- Open your bells.json file and add a new action called "audio", with an _array_ of files to play. For example:

```json
"samplebell": {
  "name": "Sample Bell",
  "description": "Sample bell that plays audio",
  "time": "* * * * *",
  "enabled": true,
  "locked": false,
  "actions": {
    "audio": {
      "files": [{
        "filename": "bell1.mp3",
        "loop": 1,
      }, {
        "filename": "bell2.mp3",
        "loop": 1
      }, {
        "filename": "bell3.mp3",
        "loop": 3
      }]
    }
  }
}
```

* Restart Bellboy
* When the bell triggers, the plugin will pick **ONE _random_ file** out of the array and play it.
