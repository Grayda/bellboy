var url = require("url"); // For parsing URLs
var Bellboy = require("./core/index.js"); // Our core Bellboy class
var moment = require("moment"); // For date parsing
var cp = require("child_process") // For calling updates
var bellboy = new Bellboy(); // The main class that schedules and enables / disables our bells

//If we're ready to go
bellboy.on("ready", function() {
  var BellValidate = require("./addons/bellvalidate/index.js") // An add-on that lets us parse and display cron jobs in a human-readable way
  bellboy.modules["bellvalidate"] = new BellValidate(bellboy)
  bellboy.modules["bellvalidate"].Prepare()
    // So we can determine the root folder
  bellboy.__dirname = __dirname
    // Show a heading
  showWelcome()
    // Load the settings and the bells
  validate = bellboy.modules["bellvalidate"].ValidateJSON(__dirname + "/config/config.json", __dirname + "/core/config/config_schema.json")
  if (validate !== true) {
    console.log("Bellboy cannot load because config file does not match schema!")
    console.dir(JSON.stringify(validate))
  } else {
    console.log("Config file matches schema. Loading..")
    bellboy.LoadSettings(__dirname + "/config/config.json")
  }
})

// Settings loaded. Load the bells now
bellboy.on("settingsloaded", function(file) {
  validate = bellboy.modules["bellvalidate"].ValidateJSON(__dirname + "/" + bellboy.config.BellFile, __dirname + "/core/config/bells_schema.json")
  if (validate !== true) {
    console.log("Bellboy cannot load because bell file does not match schema!")
    console.dir(JSON.stringify(validate))
  } else {
    console.log("Bell file matches schema. Loading..")
    bellboy.LoadBells(__dirname + "/" + bellboy.config.BellFile)
    console.log("Settings loaded from file: " + file)

  }
});

// Now the bells have loaded. We can now start
bellboy.on("bellsloaded", function(file) {
  console.log("Bells loaded from file: " + file)
    // This creates new CronJobs for each bell in our bells.json file
  bellboy.Start()
});

// ========================================================
// Job events
// ========================================================

// Emitted when a job is added. Useful for emailing when someone adds a new job,
// though it also gets called when the bells are reloaded.
// TO-DO: Change this behaviour so it only gets called when a job is added, not reloaded.
bellboy.on("jobadded", function(item) {
  // console.log("\"" + item.Name + "\" added. State is: " + item.Enabled)
})

// All the jobs are loaded. Time to load some modules!
bellboy.on("jobsloaded", function(jobs) {

  var BellLog = require("./addons/belllog/index.js") // An add-on that lets us parse and display cron jobs in a human-readable way
  var BellParser = require("./addons/bellparser/index.js") // An add-on that lets us parse and display cron jobs in a human-readable way
  var BellAuth = require("./addons/bellauth/index.js") // Gives us a front-end to work with. Depends on BellParser, so watch out for that
  var BellWeb = require("./addons/bellweb/index.js") // Gives us a front-end to work with. Depends on BellParser, so watch out for that
  var BellAudio = require("./addons/bellaudio/index.js") // A module that plays audio. Now supports Windows and Linux!
  var BellPi = require("./addons/bellpi/index.js") // An add-on that adds Raspberry Pi specific things, such as support for the Adafruit 2.2" TFT screen
  var BellMail = require("./addons/bellmail/index.js") // An add-on for emailing people.

  // We store these in bellboy.modules so other modules can use the features.
  // Some modules depend on others (e.g. BellWeb uses BellParser) so be
  // careful of load order, and check the index.js of that addon for more info
  bellboy.modules["belllog"] = new BellLog(bellboy)
  bellboy.modules["bellparser"] = new BellParser(bellboy)
  bellboy.modules["bellmail"] = new BellMail(bellboy)
  bellboy.modules["bellaudio"] = new BellAudio(bellboy)
  bellboy.modules["bellauth"] = new BellAuth(bellboy)
  bellboy.modules["bellweb"] = new BellWeb(bellboy)
  bellboy.modules["bellpi"] = new BellPi(bellboy)

  // Bellparser is loaded
  bellboy.modules["bellparser"].on("ready", function() {
    console.log("BellParser loaded")
  })

  // ========================================================
  // BellPi related stuff
  // ========================================================

  // BellPi is laoded. If necessary, we can do stuff here
  bellboy.modules["bellpi"].on("ready", function() {
    console.log("BellPi loaded")
  })

  // A button was pressed on the 2.2" TFT screen
  bellboy.modules["bellpi"].on("button", function(index) {
    switch (index) {
      case 1:
        bellboy.Trigger("_default")
        break;
    }

    // Turn on the backlight for 10 seconds, then turn it off
    bellboy.modules["bellpi"].SetBacklight(true, 10000, false)

  })

  // ========================================================
  // Bellmail related stuff
  // ========================================================

  bellboy.modules["bellmail"].on("ready", function() {
    console.log("BellMail loaded")
  })

  // If we've encountered an error when sending mail
  bellboy.modules["bellmail"].on("mailsenterror", function(err, mail, body) {
    console.log("Mail NOT sent due to error:")
    console.dir(mail)
    console.log(body)
    console.log(err)
  })

  // Email was sent successfully
  bellboy.modules["bellmail"].on("mailsent", function(mail, body) {
    console.log("Mail sent:")
    console.dir(mail)
    console.log(body)
    console.log(err)
  });

  // ========================================================
  // BellAuth related stuff
  // ========================================================

  bellboy.modules["bellauth"].on("ready", function() {
    bellboy.modules["bellauth"].LoadUsers("/users.json")
  })

  // ========================================================
  // BellWeb related events
  // ========================================================

  // BellWeb is ready (the server has started, express is ready, we're good to start accepting connections)
  bellboy.modules["bellweb"].on("ready", function() {
    console.log("BellWeb loaded")
    console.log("Access the web UI at: http://" + bellboy.modules["bellweb"].GetHostName() + ":8080")

    bellboy.modules["bellweb"].on("loggedin", function(username) {
      console.log(username + " has logged in")
    })

    // socketready lets us know that socket.io is ready to go.
    // Typically, this won't fire until a client connects
    bellboy.modules["bellweb"].on("socketready", function() {
      console.log("Socket ready")

      // Someone has asked that we delete the Log
      // TO-DO: Expose isAuthenticated so people can't craft their own JS to run commands here
      bellboy.modules["bellweb"].socket.on("deletelog", function() {
        bellboy.modules["belllog"].DeleteLog()
        bellboy.modules["bellweb"].SocketEmit("notification", {
          "title": "Log Deleted",
          "message": "bellboy.log has been deleted!"
        })
      })

      // The client has sent a message to us, telling us the webpage has asked that we simulate a PiTFT button press
      bellboy.modules["bellweb"].socket.on("button", function(button) {
        bellboy.modules["bellpi"].emit("button", button.number)
      }.bind(this))

      // The client has asked that we reload the bells and settings
      bellboy.modules["bellweb"].socket.on("reload", function() {
        console.log("Reloading settings..")

        bellboy.LoadSettings("/config/config.json")
        bellboy.LoadBells(bellboy.config.BellFile)

        // Sends a notification back to the client
        bellboy.modules["bellweb"].SocketEmit("notification", {
          "title": "Bells and settings reloaded",
          "message": "Bells and settings have been reloaded. You may need to refresh the page to see the changes",
          "timeout": 4000
        })

      })

      // The client has set the volume
      bellboy.modules["bellweb"].socket.on("setvolume", function(volume) {
        console.log("Volume set to " + volume)
        bellboy.modules["bellaudio"].SetVolume(volume)
          //
        bellboy.modules["bellweb"].SocketEmit("notification", {
          "title": "Volume changed",
          "message": "Volume set to " + volume + "!",
          "timeout": 2000
        })
      })

      // The client has manually triggered a bell
      bellboy.modules["bellweb"].socket.on("trigger", function(bell) {
        bellboy.Trigger(bell.bell)
        bellboy.modules["bellweb"].SocketEmit("notification", {
          "title": "Bell triggered",
          "message": bell.bell + " has been triggered!",
          "timeout": 2000
        })
      })

      // The client wishes to update Bellboy.
      // TO-DO: Make this ultra secure, as updates can wipe out data!
      bellboy.modules["bellweb"].socket.on("update", function(data) {
        bellboy.modules["bellweb"].SocketEmit("notification", {
          "title": "Updating..",
          "message": bellboy.config.AppName + " will be updated shortly. This may take some time. ",
          "timeout": 2000
        })

        console.log("Updating..")
          // Wait 2.5 seconds so we can display our notification to the user,
          // otherwise nodemon resets the app upon update
        setTimeout(function() {
          results = cp.execSync("git stash && git pull && npm install")
        }, 2500)

        bellboy.modules["bellweb"].SocketEmit("notification", {
          "title": bellboy.config.AppName + " Updated",
          "message": bellboy.config.AppName + " has been updated. The results of the update were:<br />" + results,
          "timeout": 60000
        })
      })

      bellboy.modules["bellweb"].socket.on("setdate", function(date) {
          bellboy.modules["bellpi"].SetDate(date.date)
        })
        // Client wants to toggle a bell.
      bellboy.modules["bellweb"].socket.on("togglebell", function(data) {
        if (data.state == true) {
          bellboy.EnableBell(data.bell)
        } else if (data.state == false) {
          bellboy.DisableBell(data.bell)
        } else {
          return
        }
        bellboy.modules["bellweb"].SocketEmit("notification", {
          "title": "Bell toggled",
          "message": bellboy.bells[data.bell].Name + " has been set to " + data.state + "!",
          "timeout": 2000
        })

      })

      // This runs every 10 seconds and provides our webpage with the next bell time
      // Almost every other update is provided on an as-needed basis (e.g. reload currently enabled bells only when someone toggles a bell)
      setInterval(function() {

        bellboy.modules["bellweb"].SocketEmit("nextbell", {
          "date": bellboy.modules["bellparser"].GetNextJob()["calendar"]
        })

        bellboy.modules["bellweb"].SocketEmit("time", {
          "time": moment()
        })

        // bellboy.modules["bellweb"].SocketEmit("reloadtable")
      }.bind(this), 10000)

      // And finally, an error event
      bellboy.modules["bellweb"].socket.on("error", function(err) {
        console.log(err)
      })
    })
  })

  // The meat of our BellWeb module. Someone has loaded a page, now
  // we need to work out what to do with it.
  // TO-DO: Clean this up, as half of these aren't active (yet / anymore)
  bellboy.modules["bellweb"].on("pageloaded", function(req) {

    switch (url.parse(req.url).pathname) {
      // We've called toggle.html
      case "/toggle.html":
        // Find out if we want to turn a bell on or off
        switch (req.params.state) {
          case "true" || true:
            // Enable, then save the bells
            bellboy.EnableBell(req.params.id)
            bellboy.SaveBells(bellboy.config.BellFile)
            break;
          case "false" || false:
            // Disable, theb save the bells
            bellboy.DisableBell(req.params.id)
            bellboy.SaveBells(bellboy.config.BellFile)
            break;
          default:
            // Not actually  a state? Don't allow it!
            console.log("Incorrect state! Received: " + req.params.state)
        }
        break;
      case "/add.html":
        console.dir(req.params)
        if (typeof req.params.submit !== "undefined") {
          console.log("Saving bell")
          bellboy.AddBell(req.params.id, {
            "Name": req.params.name,
            "Description": req.params.description,
            "Locked": "false",
            "Time": req.params.time,
            "File": req.params.files,
            "Mail": {
              "Trigger": {
                "Enabled": req.params.triggermailenabled || false,
                "To": req.params.triggermailto || "",
                "Subject": req.params.triggermailsubject || "",
                "Template": req.params.triggermailtemplate,
              },
              "Change": {
                "Enabled": req.params.changemailenabled || false,
                "To": req.params.changemailto || "",
                "Subject": req.params.changemailsubject || "",
                "Template": req.params.changemailtemplate,
              }
            }
          })

        } else {
          console.log("Not adding bell. No params")
        }

        break;
        // Manually trigger a bell
      case "/trigger.html":
        bellboy.Trigger(req.params.id)
        break;
      case "/delete.html":
        bellboy.DeleteBell("temp")
        break;
    }
  })

  // Stuff we want to look out for is done, time to ask the various modules to prepare
  bellboy.modules["belllog"].Prepare()
  bellboy.modules["bellpi"].Prepare()
  bellboy.modules["bellparser"].Prepare()
  bellboy.modules["bellauth"].Prepare()
  bellboy.modules["bellweb"].Prepare("./addons/bellweb/pages/", bellboy.config.ServerPort)
  bellboy.modules["bellmail"].Prepare()
  bellboy.modules["bellaudio"].Prepare()

})

// The bell has triggered. If you'd like to know if a bell has been triggered manually, look for manualtrigger
bellboy.on("trigger", function(item) {
  // If it's a "virtual" bell we're triggering
  if (item.substring(0, 1) == "_") {
    // We don't want the schedule stuff
    bell = bellboy.bells[item]
  } else {
    // Otherwise, we need to work out what schedle we're on and run the bell.
    bell = bellboy.bells[item]
  }

  console.log(bell.Name + " triggered!")

  // If we've set up an audio action
  if (typeof bell.Actions.Audio !== "undefined") {
    // Play the audio file
    bellboy.modules["bellaudio"].Play("/audio/" + bell.Actions.Audio.File, bell.Actions.Audio.Loop)
  }

  // If we've set up an "external" action (e.g. set Pin X to high to use with legacy tone generators)
  if (typeof bell.Actions.External !== "undefined") {
    bellboy.modules["bellpi"].TogglePin(bellboy.config.ExternalPin, 1, 0, bell.Actions.External.Duration)
  }

  // Load and send an email
  mail = bellboy.modules["bellmail"].LoadTemplate(bell.Actions.Mail.Trigger.Template, item, bell.Actions.Mail.Trigger.Subject)
  bellboy.modules["bellmail"].SendMail(bell.Actions.Mail.Trigger, mail)

  // The bell wants to switch schedules, so we write the changes into our config file
  if (typeof bell.Actions.Schedule !== "undefined") {
    this.emit("schedulechange", bellboy.config.BellFile, bell.Actions.Schedule.File)
    bellboy.config.BellFile = bell.Actions.Schedule.File
    bellboy.SaveSettings("/config/config.json")
    bellboy.LoadSettings("/config/config.json")
  }
  bellboy.modules["bellweb"].SocketEmit("reloadtable")
  bellboy.modules["bellweb"].SocketEmit("reloadstatus")
})

// The job has finished running. This includes any processes spawned (e.g. cmdmp3 or mpg123)
bellboy.on("triggerdone", function() {
  console.log("Job finished!")
})

// Someone has enabled a bell
bellboy.on("bellenabled", function(item) {
  var bell
  if (item.substring(0, 1) == "_") {
    bell = bellboy.bells[item]
  } else {
    bell = bellboy.bells[item]
  }
  console.log(bell.Name + " was enabled")
  bellboy.SaveBells(bellboy.config.BellFile)
  mail = bellboy.modules["bellmail"].LoadTemplate(bell.Actions.Mail.Change.Template, item, bell.Actions.Mail.Change.Subject)
  bellboy.modules["bellmail"].SendMail(bell.Actions.Mail.Change, mail)
  bellboy.modules["bellweb"].SocketEmit("reloadtable")
  bellboy.modules["bellweb"].SocketEmit("reloadstatus")
})

// Someone has disabled a bell
bellboy.on("belldisabled", function(item) {
  var bell
  if (item.substring(0, 1) == "_") {
    bell = bellboy.bells[item]
  } else {
    bell = bellboy.bells[item]
  }
  console.log(bell.Name + " was enabled")
  bellboy.SaveBells(bellboy.config.BellFile)
  mail = bellboy.modules["bellmail"].LoadTemplate(bell.Actions.Mail.Change.Template, item, bell.Actions.Mail.Change.Subject)
  bellboy.modules["bellmail"].SendMail(bell.Actions.Mail.Change, mail)
  bellboy.modules["bellweb"].SocketEmit("reloadtable")
  bellboy.modules["bellweb"].SocketEmit("reloadstatus")
})

bellboy.on("belladded", function(id, bell) {
  console.log("Bell added! New ID is " + id)
  bellboy.SaveBells(bellboy.config.BellFile)
  bellboy.modules["bellweb"].SocketEmit("reloadtable")
  bellboy.modules["bellweb"].SocketEmit("reloadstatus")
})

bellboy.on("belldeleted", function(id) {
  console.log("Bell " + id + " deleted")
  bellboy.SaveBells(bellboy.config.BellFile)
  bellboy.modules["bellweb"].SocketEmit("reloadtable")
  bellboy.modules["bellweb"].SocketEmit("reloadstatus")
})

bellboy.on("bellssaved", function(file) {
  console.log("Bells have been saved to " + file)
})

function showWelcome() {
  console.log()
  console.log(" Welcome to")
  console.log()
  var FONTS = require('cfonts');

  var fonts = new FONTS({
    'text': "Bellboy", //text to be converted
    'font': 'block', //define the font face
    'colors': ["white", "black"], //define all colors
    'background': 'black', //define the background color

    'space': false, //define if the output text should have empty lines on top and on the bottom
    'maxLength': '10' //define how many character can be on one line
  });
  console.log("    The Bell Timer System")
  console.log()
  console.log()

}

// We call this last, otherwise these "on" calls will fail (calling emit in bellboy BEFORE any handlers are set up? Bronchitis! (ain't nobody got time fo' dat))
bellboy.Prepare()
