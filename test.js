var _ = require("lodash")

var bell = {
  "bell": {
    "Enabled": true
  },
  "bell2": {
    "Enabled": true,
    "Actions": {
      "ToggleBells": [{
          "Name": "bell",
          "Enabled": false
        }]
      }
    }
  }

Object.keys(bell).forEach(function(item) {

  if(_.has(bell[item], "Actions.ToggleBells")) {
    console.log(item, "Has action. Doing")
    bell[item].Actions.ToggleBells.forEach(function(item2) {
      console.log("Setting", item2.Name, "to", item2.Enabled)
      bell[item2.Name].Enabled = item2.Enabled
    })
  }
})

console.dir(bell)
