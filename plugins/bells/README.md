# bellboy-bells
## Loads bells from a JSON file

## Usage
- Clone into your `plugins` directory.
- Go back to the root folder and run `gulp install-plugins`
- Edit `plugins/plugins.json` and modify the defaults if necessary
- Create a folder in the root folder called `schedules`.
- Create a bells.json file. The contents should be an object of objects. For example:

```json
{
  "samplebell": {
    "name": "Sample Bell",
    "description": "Sample bell that plays audio",
    "time": "* * * * *",
    "enabled": true,
    "locked": false,
    "actions": {

    }
  },
  "anotherbell": {
    "name": "Another Bell",
    "description": "A second sample bell",
    "time": "* * * * *",
    "enabled": true,
    "locked": false,
    "actions": {

    }
  }
}
```

* Restart Bellboy
