var url = require("url"); // For parsing URLs
var os = require("os")
var Bellboy = require("./core/index.js"); // Our core Bellboy class
var bellboy = new Bellboy(); // The main class that schedules and enables / disables our bells

// We're ready to go!
bellboy.on("ready", function() {
  // Load the settings and the bells
  bellboy.LoadSettings("../config/config.json")
})

// Settings loaded.
bellboy.on("settingsloaded", function() {
  console.log("Settings loaded!")
  bellboy.LoadBells(bellboy.config.BellFile)
});

bellboy.on("bellsloaded", function() {
  console.log("Bells loaded!")
  // Then start(). This creates new CronJobs for each bell in our bells.json file
  bellboy.Start()
});

// Emitted when a job is added. Useful for emailing when someone adds a new job,
// though it also gets called when the bells are reloaded.
// TO-DO: Change this behaviour so it only gets called when a job is added, not reloaded.
bellboy.on("jobadded", function(item) {
  // console.log("\"" + item.Name + "\" added. State is: " + item.Enabled)
})

// All the jobs are loaded. Time to load some modules!
bellboy.on("jobsloaded", function(jobs) {
  // An add-on that lets us parse and display cron jobs in a human-readable way
  var BellParser = require("./addons/bellparser/index.js")
  // Gives us a front-end to work with. Depends on BellParser, so watch out for that
  var BellWeb = require("./addons/bellweb/index.js")
  // For playing audio
  var BellAudio = require("./addons/bellaudio/index.js")
  var BellTFT = require("./addons/belltft/index.js")
  var BellMail = require("./addons/bellmail/index.js")

  // We store these in bellboy.modules so other modules can use the features
  bellboy.modules["bellparser"] = new BellParser(bellboy)
  bellboy.modules["bellmail"] = new BellMail(bellboy)
  bellboy.modules["bellaudio"] = new BellAudio(bellboy)
  bellboy.modules["bellweb"] = new BellWeb(bellboy)
  bellboy.modules["belltft"] = new BellTFT(bellboy)

  bellboy.modules["bellparser"].on("ready", function() {
    console.log("BellParser loaded")
  })

  // =============================================================================
  // BellTFT related stuff

  bellboy.modules["belltft"].on("ready", function() {
    console.log("BellTFT loaded")
  })

  bellboy.modules["belltft"].on("button1", function() {
    bellboy.Trigger("test")
  })

  // =============================================================================
  // BellMail related stuff

  bellboy.modules["bellmail"].on("ready", function() {
    console.log("BellMail loaded")
  })

  bellboy.modules["bellmail"].on("mailsenterror", function(err, mail, body) {
    console.log("Mail sent:")
    console.dir(mail)
    console.log(body)
    console.log(err)
  })


  // =============================================================================
  // Bellweb related stuff

  bellboy.modules["bellweb"].on("ready", function() {
    console.log("BellWeb loaded")
  })

  bellboy.modules["bellweb"].on("pageloaded", function(req) {
    bell = bellboy.bells[req.params.id]
    state = req.params.state

    switch (url.parse(req.url).pathname) {
      case "/toggle.html":
        switch (req.params.state) {
          case "true" || true:
            bellboy.EnableBell(req.params.id)
            bellboy.SaveBells(bellboy.config.BellFile)
            break;
          case "false" || false:
            bellboy.DisableBell(req.params.id)
            bellboy.SaveBells(bellboy.config.BellFile)
          default:
            console.log("Incorrect state! Received: " + req.params.state)
        }
        break;
      case "/trigger.html":
        bellboy.Trigger(req.params.id)
        break;
      case "/status.html":
        bellboy.modules["belltft"].emit("button" + req.params.button)
        break;
    }
  })

  bellboy.modules["bellweb"].Prepare("./addons/bellweb/pages/", bellboy.config.ServerPort)
  bellboy.modules["belltft"].Prepare("./addons/belltft/pages/", "9001")
  bellboy.modules["bellmail"].Prepare()
  bellboy.modules["bellparser"].Prepare()
  bellboy.modules["bellaudio"].Prepare()

})

bellboy.on("trigger", function(item) {
  console.log(bellboy.bells[item].Name + " triggered!")
  bellboy.modules["bellaudio"].Play("/audio/" + bellboy.bells[item].File)
  mail = bellboy.modules["bellmail"].LoadTemplate("change.ejs", item, bellboy.bells[item].Mail.Subject)
  bellboy.modules["bellmail"].SendMail(bellboy.bells[item].Mail, mail)
})

bellboy.on("bellenabled", function(bell) {
  console.log(bellboy.bells[bell].Name + " was enabled")
})

bellboy.on("belldisabled", function(bell) {
  console.log(bellboy.bells[bell].Name + " was disabled")
})


// We call this last, otherwise these "on" calls will fail (calling emit in bellboy BEFORE any handlers are set up? Bronchitis! (ain't nobody got time fo' dat))
bellboy.Prepare()
